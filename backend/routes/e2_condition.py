"""
e2_condition.py — FastAPI route for the E2 AI Condition Report Agent (Gemini).
"""

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from backend.models.schemas import ConditionRequest, ConditionResponse
from backend.services.gemini_service import generate_condition_report_gemini

router = APIRouter(prefix="/evaluate-condition", tags=["E2 — Condition Agent"])


@router.post(
    "",
    response_model=ConditionResponse,
    summary="Grade product condition using Free Gemini AI",
    description=(
        "Accepts a structured ProductPassport (images optional/ignored for now). "
        "Returns a tier, score, sourced evidence list, suggested resale price, "
        "and a professional condition report predicted by Google Gemini Flash."
    ),
)
async def evaluate_condition(request: ConditionRequest) -> ConditionResponse:
    try:
        result = await generate_condition_report_gemini(request)
    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini returned an invalid response structure: {exc.errors()}"
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to parse Gemini response: {str(exc)}"
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Internal error calling Gemini API: {str(exc)}"
        )

    return result
