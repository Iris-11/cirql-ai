from fastapi import APIRouter, HTTPException
from backend.services.passport_service import get_passports_list, get_passport_details
from typing import List, Dict, Any

router = APIRouter(
    prefix="/api/v1/passports",
    tags=["passports"]
)

@router.get("")
async def read_passports():
    try:
        return get_passports_list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}")
async def read_passport(id: str):
    try:
        details = get_passport_details(id)
        if not details:
            raise HTTPException(status_code=404, detail="Passport not found")
        return details
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
