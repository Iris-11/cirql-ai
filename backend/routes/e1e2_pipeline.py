"""
e1e2_pipeline.py — FastAPI router for the combined E1 + E2 assessment pipeline.

Endpoint: POST /api/v1/product/full-assessment
"""

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from models.schemas import ProductSubmission, FullAssessmentResult
from services.e1e2_pipeline import run_full_assessment
from utils.supabase_client import save_e1_result

router = APIRouter()


@router.post(
    "/full-assessment",
    response_model=FullAssessmentResult,
    summary="E1 + E2 — Full Product Assessment Pipeline",
    description="""
**Full Assessment Pipeline** — Runs E1 and E2 sequentially as one entity.

1. **E1 (Image Verification)** — angle completeness, authenticity, SKU match, damage detection, geo validation.
2. **E2 (Condition Grading)** — grades condition tier, score, evidence, and suggested price using E1 damage findings as enriched context.

Both `e1_result` and `e2_result` are returned independently in the response.

If `listing_id` is provided, the E1 result is automatically saved to Supabase.
    """,
)
async def full_assessment_endpoint(submission: ProductSubmission) -> FullAssessmentResult:
    try:
        result = await run_full_assessment(submission)

        if submission.listing_id:
            await save_e1_result(submission.listing_id, result.e1_result.model_dump())

        return result
    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Invalid response structure from AI service: {exc.errors()}",
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Assessment pipeline error: {str(exc)}"
        )
