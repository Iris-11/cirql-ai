from fastapi import APIRouter, HTTPException
from backend.services.dashboard_service import get_dashboard_metrics

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

@router.get("/metrics")
async def read_dashboard_metrics(year: int = None):
    try:
        metrics = get_dashboard_metrics(selected_year=year)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
