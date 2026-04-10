from fastapi import APIRouter, HTTPException
from backend.services.product_service import get_all_products
from typing import List, Dict, Any

router = APIRouter(
    prefix="/api/v1/products",
    tags=["products"]
)

@router.get("")
async def read_all_products():
    try:
        return get_all_products()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
