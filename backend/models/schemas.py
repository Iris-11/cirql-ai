from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


# ─────────────────────────────────────────────
# INPUT SCHEMAS (Shared by E1 & E2)
# ─────────────────────────────────────────────

class UserLocation(BaseModel):
    lat: float = Field(..., description="User's current latitude.")
    lng: float = Field(..., description="User's current longitude.")
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp.")


class ProductImage(BaseModel):
    photo_id: str = Field(..., description="Unique photo identifier.")
    url: str = Field(..., description="Public image URL.")
    label: str = Field(..., description="Angle label: top | bottom | front | side_left | side_right | detail")


class Ownership(BaseModel):
    number_of_owners: int
    last_purchase_date: str


class ProductPassport(BaseModel):
    # Maps to skus and brands tables
    sku_code: Optional[str] = None
    brand: str
    name: str # Renamed from product_name to match skus.name
    category: str
    age_in_months: Optional[int] = None
    retail_price_usd: Optional[float] = None # Renamed from original_price
    materials: Optional[List[str]] = None
    origin_country: Optional[str] = None # Renamed from origin
    certifications: Optional[List[str]] = None
    usage_history: Optional[str] = None
    known_issues: Optional[str] = None
    ownership: Optional[Ownership] = None
    reference_images: Optional[Dict[str, str]] = None


class ProductSubmission(BaseModel):
    product_id: str
    listing_id: Optional[str] = None
    submission_timestamp: str
    images: List[ProductImage]
    passport: ProductPassport
    grading_rubric: Optional[Dict[str, str]] = None
    user_location: Optional[UserLocation] = None


class ConditionRequest(BaseModel):
    product_id: Optional[str] = None
    submission_timestamp: Optional[str] = None
    images: List[ProductImage] = Field(default_factory=list)
    passport: ProductPassport
    grading_rubric: Optional[Dict[str, str]] = None


class EvidenceItem(BaseModel):
    claim: str = Field(description="Assertion made about the product condition")
    source: str = Field(description="Specific photo label or passport field that supports the claim")


class ConditionResponse(BaseModel):
    tier: str
    score: float
    evidence: List[EvidenceItem]
    suggested_price: float
    report_text: str
    eligible_for_resale: bool
    ws_approved: bool = True # Keep for logic, but default true


# ─────────────────────────────────────────────
# E1 — VERIFICATION OUTPUT SCHEMA
# ─────────────────────────────────────────────

class VerificationResult(BaseModel):
    complete: bool
    authenticity_score: float
    missing_angles: List[str] = Field(default_factory=list)
    flags: List[str] = Field(default_factory=list)
    proceed: bool
    matches_sku: bool = Field(default=True) # Renamed from sku_match to match SQL
    damage_detected: bool = Field(default=False)
    damage_summary: Optional[str] = None
    # ── Geo & Risk (from E1 Refactor) ──
    geo_flags: List[str] = Field(default_factory=list)
    image_age_days: Optional[float] = None
    geo_risk_score: float = 0.0
    time_risk_score: float = 0.0
    confidence_score: float = 0.0
    ui_result: Optional[Dict[str, Any]] = None