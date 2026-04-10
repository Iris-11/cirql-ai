from fastapi import APIRouter, HTTPException
from models.schemas import RoutingRequest, RoutingResponse, Impact
from services.e3_service import get_routing_decision
from utils.constants import PARTNERS, EMISSION_FACTOR, LANDFILL_FACTOR
from utils.validators import validate_ai_response

router = APIRouter()

@router.post("/route-product", response_model=RoutingResponse)
async def route_product(request: RoutingRequest):

    ai_raw = get_routing_decision(
        tier=request.condition_report.tier,
        category=request.category,
        location=request.location,
        partners=PARTNERS,
        eligible_for_resale=request.condition_report.eligible_for_resale,
        evidence=request.condition_report.evidence,
        report_text=request.condition_report.report_text
    )

    try:
        ai_data = validate_ai_response(ai_raw)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Step 2: Deterministic impact — never from AI
    co2 = round(request.weight * EMISSION_FACTOR, 2)
    landfill = round(request.weight * LANDFILL_FACTOR, 2)

    return RoutingResponse(
        action=ai_data["action"],
        partner=ai_data["partner"],
        reason=ai_data["reason"],
        impact=Impact(
            co2_avoided_kg=co2,
            landfill_diverted_kg=landfill
        )
    )