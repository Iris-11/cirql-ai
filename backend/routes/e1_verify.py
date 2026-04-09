"""
e1_verify.py — FastAPI router for E1: Product Image Verification Engine.

Endpoint: POST /api/v1/product/verify-images
"""

from fastapi import APIRouter, HTTPException
from models.schemas import ProductSubmission, VerificationResult
from services.gemini_service import verify_product
from services.supabase_client import save_e1_result

router = APIRouter()


@router.post(
    "/verify-images",
    response_model=VerificationResult,
    summary="E1 — Verify Product Images",
    description="""
**E1 Verification Engine** — Powered by Gemini Vision.

Runs a 3-step pipeline on submitted product photos:

1. **Angle Completeness** — Checks all required angles (top, bottom, side-left, side-right, front).
2. **Authenticity Check** — Detects stock photos, AI images, screenshots, and catalog images.
3. **SKU Match & Damage Assessment** — Compares images to the reference product and grades visible damage.
4. **Geo Validation** — Validates EXIF GPS location and photo timestamp against submission metadata.

If `listing_id` is included in the request, the result is automatically written to
`resale_listings.e1_result` in Supabase and the listing status is updated.
    """,
)
async def verify_images_endpoint(submission: ProductSubmission):
    try:
        result = await verify_product(submission)

        # Write result back to Supabase if listing_id was provided
        if submission.listing_id:
            await save_e1_result(submission.listing_id, result.model_dump())

        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification engine error: {str(e)}")

