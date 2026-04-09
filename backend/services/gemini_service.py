"""
gemini_service.py — E1 Verification Engine using Gemini Vision.

Pipeline:
  1. Download all submitted images + optional reference SKU image (concurrent)
  2. Run EXIF GPS extraction on raw bytes → geo validation against user_location
  3. Run 3-part multimodal Gemini prompt:
     a) Authenticity & angle completeness
     b) SKU visual match vs. reference image
     c) Damage & condition assessment
  4. Merge geo flags into final result
  5. Hallucination guard: retry once on JSON parse failure
"""

import os
import json
import base64
import asyncio
import httpx
import google.generativeai as genai
from typing import Optional, List, Tuple
from dotenv import load_dotenv

load_dotenv()

from models.schemas import ProductSubmission, VerificationResult
from utils.geo_utils import validate_geo

# ── Configure Gemini ──────────────────────────────────────────────────────────
_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if _API_KEY:
    genai.configure(api_key=_API_KEY)

REQUIRED_ANGLES = ["top view", "bottom view", "side-left", "side-right", "front view"]


# ── Image Utility ─────────────────────────────────────────────────────────────

async def _fetch_image(url: str, client: httpx.AsyncClient) -> Optional[Tuple[dict, bytes]]:
    """
    Fetch an image from a URL.
    Returns (gemini_inline_data_part, raw_bytes) or None on failure.
    raw_bytes are needed for EXIF extraction.
    """
    try:
        r = await client.get(url, timeout=15.0, follow_redirects=True)
        r.raise_for_status()
        raw = r.content
        mime = r.headers.get("content-type", "image/jpeg").split(";")[0].strip()
        inline_data = {"mime_type": mime, "data": base64.b64encode(raw).decode("utf-8")}
        return inline_data, raw
    except Exception as e:
        print(f"[gemini_service] Failed to fetch {url}: {e}")
        return None


async def _fetch_all_images(
    submission: ProductSubmission,
) -> Tuple[List[dict], List[bytes], Optional[dict]]:
    """
    Concurrently fetch all submitted images and the optional reference SKU image.
    Picks best available reference angle from passport.reference_images dict
    (priority: front > top > side_left > any first key).
    Returns:
        submitted_parts   — list of labeled Gemini content parts
        raw_bytes_list    — raw bytes for each submitted image (for EXIF extraction)
        ref_part          — Gemini inline_data for reference image or None
    """
    urls = [(img.url, img.label) for img in submission.images]

    # Pick the best reference image from the dict (DB stores one per angle)
    ref_url: Optional[str] = None
    ref_images = submission.passport.reference_images
    if ref_images:
        PREFERRED_ANGLES = ["front", "top", "side_left", "side_right", "bottom"]
        for angle in PREFERRED_ANGLES:
            if angle in ref_images:
                ref_url = ref_images[angle]
                break
        if not ref_url:  # fallback to first key
            ref_url = next(iter(ref_images.values()))

    async with httpx.AsyncClient() as client:
        tasks = [_fetch_image(url, client) for url, _ in urls]
        if ref_url:
            tasks.append(_fetch_image(ref_url, client))
        results = await asyncio.gather(*tasks)

    n = len(urls)
    submitted_results = results[:n]
    ref_result = results[n] if ref_url else None

    submitted_parts: List[dict] = []
    raw_bytes_list: List[bytes] = []

    for (url, label), fetch_result in zip(urls, submitted_results):
        if fetch_result:
            inline_data, raw = fetch_result
            submitted_parts.append(f"[IMAGE ANGLE: {label}]")
            submitted_parts.append({"inline_data": inline_data})
            raw_bytes_list.append(raw)

    ref_part = None
    if ref_result:
        inline_data, _ = ref_result
        ref_part = {"inline_data": inline_data}

    return submitted_parts, raw_bytes_list, ref_part


# ── Prompt Builder ────────────────────────────────────────────────────────────

def _build_prompt(submission: ProductSubmission, has_reference: bool) -> str:
    passport_json = submission.passport.model_dump_json(indent=2)

    sku_match_instruction = (
        """
### STEP 2B: SKU VISUAL MATCH
A reference image of the original product has been provided (labeled [REFERENCE IMAGE]).
Compare submitted images against this reference:
- Same model? (shape, size, handle design, brand markings)
- Correct SKU/product being returned?
Set "sku_match" to false and add flag "sku_mismatch" if they are clearly different products.
"""
        if has_reference
        else """
### STEP 2B: SKU VISUAL MATCH
No reference image provided. Evaluate whether the product in the images matches the
passport description (category and product_name). If clearly inconsistent, set "sku_match"
to false and add flag "category_mismatch".
"""
    )

    return f"""
You are a product verification AI for Williams-Sonoma resale programme.
Evaluate customer-submitted product photos with zero tolerance for fraud.

Product Passport:
{passport_json}

---

### STEP 1: ANGLE COMPLETENESS CHECK
Required angles: top view, bottom view, side-left, side-right, front view.
Also check for "close-up of damage" if passport lists known_issues.
Rules:
- Multiple images covering similar angles = valid.
- Ambiguous or unclear angle = mark as missing.
- List missing angles in "missing_angles".

---

### STEP 2A: IMAGE AUTHENTICITY CHECK
Flag images that are: stock photos, screenshots, catalog images, or AI-generated.

Red flags for NON-authentic images:
- Pure white / seamless studio backgrounds with no environmental context
- Watermarks, brand overlays, or text overlays
- Inconsistent lighting direction across images
- Unnaturally perfect textures
- Same image submitted for multiple different angles

Aggregate into "authenticity_score" (0.0 = definitely fake, 1.0 = definitely genuine).
If score < 0.6 → add flag "low_authenticity"
If stock photos specifically → also add flag "possible_stock_images"

---

{sku_match_instruction}

---

### STEP 3: DAMAGE ASSESSMENT
Examine every image closely for:
- Scratches (hairline or deep gouges)
- Dents, warping, or structural deformation
- Discoloration, rust, burn marks, staining
- Missing parts, loose handles, broken lids

Set "damage_detected" to true if ANY defect is found.
Write a concise "damage_summary" citing the specific labeled angle and what was found.
Example: "front_view shows hairline scratches on base. close_up_damage shows rim discoloration."
If no damage: set damage_summary to null.

---

### STEP 4: FINAL DECISION
"complete" = true only if ALL required angles are present.
"proceed" = true if: authenticity_score >= 0.6 AND no critical mismatch AND reasonable coverage.

---

### HALLUCINATION GUARD — STRICT RULES
1. Return ONLY valid JSON. No markdown fences, no prose outside the JSON.
2. Valid flags ONLY: "missing_angles", "low_authenticity", "possible_stock_images",
   "category_mismatch", "sku_mismatch", "inconsistent_images", "insufficient_images"
3. "damage_summary" MUST reference a specific labeled angle or be null.
4. If uncertain → be conservative, set proceed = false.

---

Respond ONLY with this exact JSON (no extra keys, no missing keys):
{{
  "complete": boolean,
  "authenticity_score": number,
  "missing_angles": [string],
  "flags": [string],
  "proceed": boolean,
  "sku_match": boolean,
  "damage_detected": boolean,
  "damage_summary": string | null
}}
"""


# ── Main Verification Function ────────────────────────────────────────────────

async def verify_product(submission: ProductSubmission) -> VerificationResult:
    """
    Full E1 pipeline:
      1. Fetch images concurrently
      2. Run EXIF geo validation
      3. Call Gemini (with 1 retry on failure)
      4. Merge geo flags and return VerificationResult
    """
    if not _API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured in .env")

    # ── Step 1: Download images ──
    submitted_parts, raw_bytes_list, ref_part = await _fetch_all_images(submission)

    if not submitted_parts:
        return VerificationResult(
            complete=False,
            authenticity_score=0.0,
            missing_angles=REQUIRED_ANGLES,
            flags=["insufficient_images"],
            proceed=False,
            sku_match=False,
            damage_detected=False,
            damage_summary=None,
            geo_flags=["no_exif_data"],
            location_distance_km=None,
            image_age_days=None,
        )

    # ── Step 2: EXIF Geo Validation ──
    user_lat = submission.user_location.lat if submission.user_location else None
    user_lng = submission.user_location.lng if submission.user_location else None

    geo_result = validate_geo(
        raw_bytes_list,
        user_lat,
        user_lng,
        submission_timestamp=submission.submission_timestamp,
    )
    geo_flags = geo_result["flags"]
    location_distance_km = geo_result.get("max_distance_km")
    image_age_days = geo_result.get("max_age_days")

    print(f"[gemini_service] Geo check → has_exif={geo_result['has_exif']}, "
          f"has_datetime={geo_result['has_datetime_exif']}, "
          f"max_dist={location_distance_km}km, age={image_age_days}d, flags={geo_flags}")

    # ── Step 3: Gemini Vision Call (Using Stable 1.5 Flash for better Quota) ──
    has_reference = ref_part is not None
    prompt = _build_prompt(submission, has_reference)

    contents = [prompt] + submitted_parts
    if has_reference:
        contents.append("[REFERENCE IMAGE — canonical product from WS catalog:]")
        contents.append(ref_part)

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash-latest",
        generation_config={
            "response_mime_type": "application/json",
            "temperature": 0.0,
        },
    )

    # ── Step 4: Call with hallucination-guard retry & 429 handling ──
    for attempt in range(2):
        try:
            print(f"[gemini_service] Starting Full Product Verification (Attempt {attempt + 1})...")
            response = await model.generate_content_async(contents)
            parsed = json.loads(response.text)

            # Merge geo flags
            all_flags = list(set(parsed.get("flags", []) + geo_flags))

            # Hard blocks from geo checks
            if "location_mismatch" in geo_flags:
                parsed["authenticity_score"] = min(parsed.get("authenticity_score", 1.0), 0.4)
                parsed["proceed"] = False
            if "stale_image" in geo_flags:
                parsed["proceed"] = False

            return VerificationResult(
                **{**parsed, "flags": all_flags},
                geo_flags=geo_flags,
                location_distance_km=location_distance_km,
                image_age_days=image_age_days,
            )

        except Exception as e:
            error_msg = str(e)
            print(f"[gemini_service] Attempt {attempt + 1} failed: {error_msg}")
            
            # If hit rate limit, wait a bit before the second attempt
            if "429" in error_msg and attempt == 0:
                wait_time = 5
                print(f"[gemini_service] Rate limit hit. Waiting {wait_time}s before automatic retry...")
                await asyncio.sleep(wait_time)

            if attempt == 1:
                return VerificationResult(
                    complete=False,
                    authenticity_score=0.0,
                    missing_angles=[],
                    flags=["system_processing_error"] + geo_flags,
                    proceed=False,
                    sku_match=False,
                    damage_detected=False,
                    damage_summary="Verification could not be completed due to a processing error.",
                    geo_flags=geo_flags,
                    location_distance_km=location_distance_km,
                    image_age_days=image_age_days,
                )
