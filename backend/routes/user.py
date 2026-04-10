"""
user.py — User-specific data endpoints.

GET /api/v1/user/{customer_id}/passports
  - Returns all passports owned by the customer, joined with skus + brand name
  - Used by the mobile app to show "My Products" before verification
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict

from utils.supabase_client import get_supabase_client

router = APIRouter()


class UserPassport(BaseModel):
    passport_id: str
    sku_code: str
    name: str
    brand: str
    category: str
    weight_kg: Optional[float] = None
    materials: Optional[List[str]] = None
    retail_price_usd: Optional[float] = None
    manufacture_date: Optional[str] = None
    reference_images: Optional[Dict[str, str]] = None
    required_angles: Optional[List[str]] = None
    condition_tier: Optional[str] = None
    sustainability_score: Optional[str] = None
    ownership_count: int = 1
    passport_status: str


@router.get(
    "/{customer_id}/passports",
    response_model=List[UserPassport],
    summary="Get user's product passports",
    description="Returns all active passports owned by the customer, with SKU and brand details.",
)
def get_user_passports(customer_id: str):
    client = get_supabase_client(use_admin=True)

    try:
        result = (
            client.table("passports")
            .select(
                "id, condition_tier, sustainability_score, ownership_count, status, "
                "skus(sku_code, name, category, weight_kg, materials, retail_price_usd, "
                "manufacture_date, reference_images, required_angles, brands(name))"
            )
            .eq("current_owner_id", customer_id)
            .in_("status", ["active", "listed"])
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    passports = []
    for row in result.data:
        sku = row.get("skus") or {}
        brand_data = sku.get("brands") or {}
        brand_name = brand_data.get("name", "Unknown Brand") if isinstance(brand_data, dict) else "Unknown Brand"

        passports.append(UserPassport(
            passport_id=row["id"],
            sku_code=sku.get("sku_code", ""),
            name=sku.get("name", "Unknown Product"),
            brand=brand_name,
            category=sku.get("category", ""),
            weight_kg=float(sku["weight_kg"]) if sku.get("weight_kg") else None,
            materials=sku.get("materials"),
            retail_price_usd=float(sku["retail_price_usd"]) if sku.get("retail_price_usd") else None,
            manufacture_date=sku.get("manufacture_date"),
            reference_images=sku.get("reference_images"),
            required_angles=sku.get("required_angles"),
            condition_tier=row.get("condition_tier"),
            sustainability_score=str(row["sustainability_score"]) if row.get("sustainability_score") is not None else None,
            ownership_count=row.get("ownership_count", 1),
            passport_status=row.get("status", "active"),
        ))

    return passports
