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
import hashlib
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
) -> Tuple[List[dict], List[Tuple[str, bytes]], Optional[dict]]:
    """
    Concurrently fetch submitted images (raw bytes for EXIF + duplicate detection).
    Groq content parts use the original public URLs to avoid 413 errors.
    Returns:
        submitted_parts   — list of Groq content parts (text label + image_url)
        raw_labeled       — list of (label, bytes) pairs for each successfully fetched image
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

    # Download submitted images for EXIF extraction + duplicate detection
    async with httpx.AsyncClient() as client:
        tasks = [_fetch_image(url, client) for url, _ in urls]
        results = await asyncio.gather(*tasks)

    submitted_parts: List[dict] = []
    raw_labeled: List[Tuple[str, bytes]] = []

    for (url, label), fetch_result in zip(urls, results):
        if fetch_result:
            raw_labeled.append((label, fetch_result))
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

    return submitted_parts, raw_labeled, ref_part


_SIDE_LABELS = {"side_left", "side-left", "side_right", "side-right"}


def _detect_duplicates(raw_labeled: List[Tuple[str, bytes]]) -> Tuple[bool, bool]:
    """
    Hash-compare fetched images to detect duplicate submissions.
    Returns:
        has_side_only_dup  — True if only side_left/side_right are duplicates (minor)
        has_severe_dup     — True if any non-side angles are duplicated (heavy penalty)
    """
    hash_to_labels: dict = {}
    for label, raw_bytes in raw_labeled:
        h = hashlib.md5(raw_bytes).hexdigest()
        hash_to_labels.setdefault(h, []).append(label)

    has_side_only_dup = False
    has_severe_dup = False
    for labels in hash_to_labels.values():
        if len(labels) < 2:
            continue
        if set(labels).issubset(_SIDE_LABELS):
            has_side_only_dup = True
        else:
            has_severe_dup = True

    return has_side_only_dup, has_severe_dup


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
    submitted_parts, raw_labeled, ref_part = await _fetch_all_images(submission)

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

    # ── Step 1b: Duplicate image detection ──
    has_side_only_dup, has_severe_dup = _detect_duplicates(raw_labeled)
    raw_bytes_list = [b for _, b in raw_labeled]

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
    geo_risk = geo_result.get("geo_risk_score", 0.0)
    time_risk = geo_result.get("time_risk_score", 0.0)

    print(f"[gemini_service] Geo check -> has_exif={geo_result['has_exif']}, "
          f"has_datetime={geo_result['has_datetime_exif']}, "
          f"max_dist={location_distance_km}km, age={image_age_days}d, flags={geo_flags}")
    print(f"[gemini_service] Risk Scores -> geo={geo_risk}, time={time_risk}")

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

            # Merge geo flags + duplicate flags
            dup_flags = []
            if has_severe_dup:
                dup_flags.append("duplicate_images")
            if has_side_only_dup:
                dup_flags.append("duplicate_side_images")
            all_flags = list(set(parsed.get("flags", []) + geo_flags + dup_flags))

            # ── Probabilistic Confidence Scoring ──
            auth_score = parsed.get("authenticity_score", 0.0)
            is_complete = parsed.get("complete", False)

            # Duplicate penalty: severe = -0.4, side-only = -0.1
            dup_penalty = 0.4 if has_severe_dup else (0.1 if has_side_only_dup else 0.0)

            # Formula: 0.5*auth + 0.2*complete + 0.2*(1-geo_risk) + 0.1*(1-time_risk) - dup_penalty
            confidence = (
                0.5 * auth_score +
                0.2 * (1.0 if is_complete else 0.0) +
                0.2 * (1.0 - geo_risk) +
                0.1 * (1.0 - time_risk) -
                dup_penalty
            )
            confidence = max(0.0, min(1.0, confidence))

            # Decide 'proceed' based on confidence threshold
            proceed = confidence >= 0.7
            if has_severe_dup:
                proceed = False
            if "location_mismatch" in geo_flags and geo_risk > 0.5:
                proceed = False
            if "stale_image" in geo_flags and time_risk > 0.5:
                proceed = False

            # Override complete + set completeness_note when severe duplicates detected —
            # the LLM sees labels not file identity, so it marks complete even when
            # all images are the same file.
            completeness_note: Optional[str] = None
            if has_severe_dup:
                parsed["complete"] = False
                completeness_note = (
                    "Identical images detected across multiple non-side angles. "
                    "Each required angle must be a distinct photo of the product."
                )
            elif has_side_only_dup:
                # complete can still be true, but flag the repetition
                completeness_note = (
                    "Left and right side images appear identical. "
                    "Consider submitting separate photos for each side if they differ."
                )
            elif not parsed.get("complete", True):
                missing = parsed.get("missing_angles", [])
                completeness_note = (
                    f"Missing required angles: {', '.join(missing)}."
                    if missing else "One or more required angles could not be verified."
                )

            return VerificationResult(
                **{**parsed, "flags": all_flags, "proceed": proceed},
                completeness_note=completeness_note,
                geo_flags=geo_flags,
                location_distance_km=location_distance_km,
                image_age_days=image_age_days,
                geo_risk_score=geo_risk,
                time_risk_score=time_risk,
                confidence_score=round(confidence, 3)
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
                    confidence_score=0.0,
                    missing_angles=[],
                    flags=["manual_review_required"] + geo_flags,
                    proceed=False,
                    sku_match=False,
                    damage_detected=False,
                    damage_summary="Verification could not be completed automatically. Fallback to manual review.",
                    geo_flags=geo_flags,
                    location_distance_km=location_distance_km,
                    image_age_days=image_age_days,
                    geo_risk_score=geo_risk,
                    time_risk_score=time_risk,
                )
