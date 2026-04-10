from fastapi import APIRouter, HTTPException
from backend.services.resale_service import get_resale_history
from typing import List, Dict, Any

router = APIRouter(
    prefix="/api/v1/resale",
    tags=["resale"]
)

@router.get("")
async def read_resale_history():
    try:
        return get_resale_history()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
