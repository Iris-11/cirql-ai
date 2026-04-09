"""
gemini_service.py — E1 Verification Engine using Groq Vision (Llama 4 Scout).

Pipeline:
  1. Download all submitted images + optional reference SKU image (concurrent)
  2. Run EXIF GPS extraction on raw bytes → geo validation against user_location
  3. Run multimodal Groq prompt:
     a) Authenticity & angle completeness
     b) SKU visual match vs. reference image
     c) Damage & condition assessment
  4. Merge geo flags into final result
  5. Hallucination guard: retry once on JSON parse failure
"""

import os
import json
import asyncio
import httpx
from groq import AsyncGroq
from typing import Optional, List, Tuple
from dotenv import load_dotenv

load_dotenv()

from models.schemas import ProductSubmission, VerificationResult
from utils.geo_utils import validate_geo

# ── Configure Groq ────────────────────────────────────────────────────────────
_API_KEY = os.environ.get("GROQ_API_KEY", "")
_client = AsyncGroq(api_key=_API_KEY) if _API_KEY else None

VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
REQUIRED_ANGLES = ["top view", "bottom view", "side-left", "side-right", "front view"]


# ── Image Utility ─────────────────────────────────────────────────────────────

async def _fetch_image(url: str, client: httpx.AsyncClient) -> Optional[bytes]:
    """
    Fetch an image from a URL.
    Returns raw bytes or None on failure.
    """
    try:
        r = await client.get(url, timeout=15.0, follow_redirects=True)
        r.raise_for_status()
        return r.content
    except Exception as e:
        print(f"[gemini_service] Failed to fetch {url}: {e}")
        return None


async def _fetch_all_images(
    submission: ProductSubmission,
) -> Tuple[List[dict], List[bytes], Optional[dict]]:
    """
    Concurrently fetch submitted images (raw bytes for EXIF only).
    Groq content parts use the original public URLs to avoid 413 errors.
    Returns:
        submitted_parts   — list of Groq content parts (text label + image_url using original URLs)
        raw_bytes_list    — raw bytes for each submitted image (for EXIF extraction)
        ref_part          — Groq image_url part for reference image or None
    """
    ref_url: Optional[str] = None
    ref_images = submission.passport.reference_images
    if ref_images:
        PREFERRED_ANGLES = ["front", "top", "side_left", "side_right", "bottom"]
        for angle in PREFERRED_ANGLES:
            if angle in ref_images:
                ref_url = ref_images[angle]
                break
        if not ref_url:
            ref_url = next(iter(ref_images.values()))

    # Llama 4 Scout supports max 5 images total. Reserve 1 slot for reference if present.
    MAX_IMAGES = 4 if ref_url else 5
    all_images = submission.images[:MAX_IMAGES]
    urls = [(img.url, img.label) for img in all_images]

    # Download submitted images for EXIF extraction only (not for Groq payload)
    async with httpx.AsyncClient() as client:
        tasks = [_fetch_image(url, client) for url, _ in urls]
        results = await asyncio.gather(*tasks)

    submitted_parts: List[dict] = []
    raw_bytes_list: List[bytes] = []

    for (url, label), fetch_result in zip(urls, results):
        if fetch_result:
            raw_bytes_list.append(fetch_result)
            # Pass URL directly to Groq — avoids base64 bloat and 413 errors
            submitted_parts.append({"type": "text", "text": f"[IMAGE ANGLE: {label}]"})
            submitted_parts.append({
                "type": "image_url",
                "image_url": {"url": url}
            })

    ref_part = None
    if ref_url:
        ref_part = {
            "type": "image_url",
            "image_url": {"url": ref_url}
        }

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

### STRICT OUTPUT RULES
1. Return ONLY valid JSON. No markdown fences, no prose outside the JSON.
2. Valid flags ONLY: "missing_angles", "low_authenticity", "possible_stock_images",
   "category_mismatch", "sku_mismatch", "inconsistent_images", "insufficient_images"
3. "damage_summary" MUST reference a specific labeled angle or be null.
4. If uncertain → be conservative, set proceed = false.

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
      3. Call Groq Vision (with 1 retry on failure)
      4. Merge geo flags and return VerificationResult
    """
    if not _client:
        raise RuntimeError("GROQ_API_KEY is not configured in .env")

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

    print(f"[gemini_service] Geo check -> has_exif={geo_result['has_exif']}, "
          f"has_datetime={geo_result['has_datetime_exif']}, "
          f"max_dist={location_distance_km}km, age={image_age_days}d, flags={geo_flags}")

    # ── Step 3: Build message content ──
    has_reference = ref_part is not None
    prompt_text = _build_prompt(submission, has_reference)

    content: List[dict] = [{"type": "text", "text": prompt_text}]
    content.extend(submitted_parts)
    if has_reference:
        content.append({"type": "text", "text": "[REFERENCE IMAGE — canonical product from WS catalog:]"})
        content.append(ref_part)

    # ── Step 4: Call Groq with retry ──
    for attempt in range(2):
        try:
            print(f"[gemini_service] Starting Full Product Verification (Attempt {attempt + 1})...")
            response = await _client.chat.completions.create(
                model=VISION_MODEL,
                messages=[{"role": "user", "content": content}],
                temperature=0.0,
                response_format={"type": "json_object"},
            )
            parsed = json.loads(response.choices[0].message.content)

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

            if "429" in error_msg and attempt == 0:
                print("[gemini_service] Rate limit hit. Waiting 5s before retry...")
                await asyncio.sleep(5)

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
