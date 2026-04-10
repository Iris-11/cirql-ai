"""
e1e2_pipeline.py — Combined E1 + E2 + E3 pipeline endpoint.

POST /api/v1/product/full-assessment
  1. Run E1 + E2
  2. If confidence >= 0.7 → run E3, save all, return results
  3. If confidence < 0.7 → save pending_review, skip E3, return pending
"""

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from models.schemas import (
    ProductSubmission, FullPipelineResult, RoutingResponse, Impact
)
from services.e1e2_pipeline import run_full_assessment
from services.e3_service import get_routing_decision
from utils.supabase_client import save_full_assessment
from utils.constants import PARTNERS, EMISSION_FACTOR, LANDFILL_FACTOR
from utils.validators import validate_ai_response

router = APIRouter()

CONFIDENCE_THRESHOLD = 0.7


@router.post(
    "/full-assessment",
    response_model=FullPipelineResult,
    summary="E1 + E2 + E3 — Full Assessment Pipeline",
)
async def full_assessment_endpoint(submission: ProductSubmission) -> FullPipelineResult:
    listing_id = submission.listing_id
    if not listing_id:
        raise HTTPException(status_code=400, detail="listing_id is required.")

    try:
        # ── Step 1: E1 + E2 ─────────────────────────────────────────────────
        assessment = await run_full_assessment(submission)
        e1 = assessment.e1_result
        e2 = assessment.e2_result
        confidence = e1.confidence_score

        pending_review = confidence < CONFIDENCE_THRESHOLD
        e3_result: RoutingResponse | None = None

        # ── Step 2: E3 if confidence passes ─────────────────────────────────
        if not pending_review:
            weight = submission.passport.weight or 1.0
            location = submission.location or "Unknown"

            ai_raw = get_routing_decision(
                tier=e2.tier,
                category=submission.passport.category,
                location=location,
                partners=PARTNERS,
                eligible_for_resale=e2.eligible_for_resale,
                evidence=e2.evidence,
                report_text=e2.report_text,
            )
            try:
                ai_data = validate_ai_response(ai_raw)
                e3_result = RoutingResponse(
                    action=ai_data["action"],
                    partner=ai_data["partner"],
                    reason=ai_data["reason"],
                    impact=Impact(
                        co2_avoided_kg=round(weight * EMISSION_FACTOR, 2),
                        landfill_diverted_kg=round(weight * LANDFILL_FACTOR, 2),
                    ),
                )
            except (ValueError, Exception) as e:
                print(f"[pipeline] E3 failed: {e} — continuing without E3")

        # ── Step 3: Save to DB ───────────────────────────────────────────────
        save_full_assessment(
            listing_id=listing_id,
            e1_result=e1.model_dump(),
            e2_result=e2.model_dump(),
            e3_result=e3_result.model_dump() if e3_result else None,
            confidence_score=confidence,
            pending_review=pending_review,
        )

        return FullPipelineResult(
            listing_id=listing_id,
            confidence_score=confidence,
            pending_review=pending_review,
            e1_result=e1,
            e2_result=e2,
            e3_result=e3_result,
        )

    except ValidationError as exc:
        raise HTTPException(status_code=502, detail=f"AI response invalid: {exc.errors()}")
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(exc)}")
