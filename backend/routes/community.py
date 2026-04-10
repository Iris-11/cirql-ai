"""
community.py — Community-level metrics for the home screen.

GET /api/v1/community/stats
  Returns aggregated platform-wide sustainability and activity metrics.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.community_service import get_community_stats

router = APIRouter()


class CommunityStatsResponse(BaseModel):
    total_co2_saved_kg: float
    total_landfill_diverted_kg: float
    total_items_rehomed: int
    resales_this_year: int
    total_members_active: int
    total_donated_recycled: int


@router.get(
    "/stats",
    response_model=CommunityStatsResponse,
    summary="Get community-wide sustainability metrics",
    description=(
        "Returns platform-wide metrics for the home screen: "
        "all-time CO2 saved, landfill diverted, items rehomed, "
        "current-year resales, active members, and total donations/recycles."
    ),
)
async def get_stats():
    try:
        return await get_community_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch community stats: {str(e)}")
