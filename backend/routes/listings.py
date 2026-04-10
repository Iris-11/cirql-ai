from fastapi import APIRouter, HTTPException
from backend.services.listing_service import get_pending_approvals, approve_listing, reject_listing
from typing import List, Dict, Any

router = APIRouter(
    prefix="/api/v1/listing",
    tags=["listings"]
)

@router.get("/pending-approvals")
async def read_pending_approvals():
    try:
        return get_pending_approvals()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{listing_id}/approve")
async def approve(listing_id: str):
    try:
        return approve_listing(listing_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{listing_id}/reject")
async def reject(listing_id: str):
    try:
        return reject_listing(listing_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
