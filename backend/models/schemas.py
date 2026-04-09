"""
schemas.py — Shared Pydantic models for the Cirql AI Backend.
Used across E1 (Verification) and E2 (Condition Grading) engines.
"""


from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any


# ─────────────────────────────────────────────
# INPUT SCHEMAS
# ─────────────────────────────────────────────

class UserLocation(BaseModel):
    lat: float = Field(..., description="User's current latitude (from browser navigator.geolocation).")
    lng: float = Field(..., description="User's current longitude (from browser navigator.geolocation).")
    timestamp: Optional[str] = Field(default=None, description="ISO 8601 timestamp when location was captured.")


class ProductImage(BaseModel):
    photo_id: str = Field(..., description="Unique identifier for this photo.")
    url: str = Field(..., description="Publicly accessible URL (e.g. Supabase Storage public URL).")
    label: str = Field(..., description="Angle label: front_view | top_view | bottom_view | side_left | side_right | close_up_damage")


class Ownership(BaseModel):
    number_of_owners: int
    last_purchase_date: str


class Passport(BaseModel):
    # ── Maps directly to skus + passports tables ──
    sku_code: Optional[str] = Field(
        default=None,
        description="SKU code from skus.sku_code (e.g. 'WS-PAN-001'). Used for DB lookup."
    )
    brand: str
    product_name: str
    category: str
    age_in_months: Optional[int] = None
    original_price: Optional[float] = None
    materials: Optional[List[str]] = None
    origin: Optional[str] = None
    certifications: Optional[List[str]] = None
    usage_history: Optional[str] = None
    known_issues: Optional[str] = None
    ownership: Optional[Ownership] = None
    # Maps to skus.reference_images jsonb: {"top": "url", "front": "url", ...}
    # The backend picks the best available angle for SKU visual comparison.
    reference_images: Optional[Dict[str, str]] = Field(
        default=None,
        description="Dict of angle → URL from skus.reference_images. E.g. {'front': 'https://...', 'top': 'https://...'}"
    )


class GradingRubric(BaseModel):
    near_mint: str = "No visible wear. All parts intact."
    excellent: str = "Minor signs of use. Fully functional."
    good: str = "Visible wear. No structural damage."
    fair: str = "Heavy wear. Still usable."
    not_eligible: str = "Damaged or incomplete."


class ProductSubmission(BaseModel):
    product_id: str
    # listing_id maps to resale_listings.id — used to write e1_result back to DB
    listing_id: Optional[str] = Field(
        default=None,
        description="resale_listings.id — if provided, the E1 result is automatically saved back to Supabase."
    )
    submission_timestamp: str
    images: List[ProductImage]
    passport: Passport
    grading_rubric: Optional[GradingRubric] = None
    user_location: Optional[UserLocation] = Field(
        default=None,
        description="Optional: user's current GPS location captured from browser for EXIF cross-validation."
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "product_id": "PROD_12345",
                "submission_timestamp": "2026-04-09T12:30:00Z",
                "images": [
                    {"photo_id": "photo_1", "url": "https://<supabase>.supabase.co/storage/v1/object/public/products/front.jpg", "label": "front_view"},
                    {"photo_id": "photo_2", "url": "https://<supabase>.supabase.co/storage/v1/object/public/products/side.jpg", "label": "side_left"},
                    {"photo_id": "photo_3", "url": "https://<supabase>.supabase.co/storage/v1/object/public/products/damage.jpg", "label": "close_up_damage"}
                ],
                "listing_id": "e0000000-0000-0000-0000-000000000001",
                "passport": {
                    "sku_code": "WS-PAN-001",
                    "brand": "Williams-Sonoma",
                    "product_name": "All-Clad D3 10in Skillet",
                    "category": "cookware",
                    "age_in_months": 30,
                    "original_price": 179.95,
                    "materials": ["stainless_steel", "aluminum"],
                    "origin": "China",
                    "certifications": [],
                    "usage_history": "Used regularly for home cooking",
                    "known_issues": "Minor scratches on base surface",
                    "ownership": {"number_of_owners": 1, "last_purchase_date": "2022-09-01"},
                    "reference_images": {
                        "top": "https://placehold.co/600x400?text=Pan+Top",
                        "bottom": "https://placehold.co/600x400?text=Pan+Bottom",
                        "front": "https://placehold.co/600x400?text=Pan+Front",
                        "side_left": "https://placehold.co/600x400?text=Pan+Left",
                        "side_right": "https://placehold.co/600x400?text=Pan+Right"
                    }
                },
                "grading_rubric": {
                    "near_mint": "No visible wear. All parts intact.",
                    "excellent": "Minor signs of use. Fully functional.",
                    "good": "Visible wear. No structural damage.",
                    "fair": "Heavy wear. Still usable.",
                    "not_eligible": "Damaged or incomplete."
                }
            }
        }
    }


# ─────────────────────────────────────────────
# E1 — VERIFICATION OUTPUT SCHEMA
# ─────────────────────────────────────────────

class VerificationResult(BaseModel):
    complete: bool = Field(..., description="True if all required angles are present.")
    authenticity_score: float = Field(..., ge=0.0, le=1.0, description="0.0 = fake/stock, 1.0 = genuine user photo.")
    missing_angles: List[str] = Field(default_factory=list, description="List of required angles that were not detected.")
    flags: List[str] = Field(default_factory=list, description="Policy violations detected, e.g. 'low_authenticity', 'category_mismatch'.")
    proceed: bool = Field(..., description="True if submission passes all gates.")
    sku_match: bool = Field(default=True, description="True if images visually match the reference SKU product.")
    damage_detected: bool = Field(default=False, description="True if visible damage (scratches, dents, discoloration) is found.")
    damage_summary: Optional[str] = Field(default=None, description="Human-readable summary of detected damage.")
    # ── Geo fields ──
    geo_flags: List[str] = Field(default_factory=list, description="Geolocation flags: 'no_exif_data' | 'location_mismatch' | 'stale_image'.")
    image_age_days: Optional[float] = Field(default=None, description="Age of the oldest submitted photo in days relative to submission_timestamp.")
    # ── Scoring fields ──
    geo_risk_score: float = Field(default=0.0, description="0.0 = safe, 1.0 = high risk location mismatch.")
    time_risk_score: float = Field(default=0.0, description="0.0 = recent, 1.0 = very old or future timestamp.")
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Aggregate trust score. High is better.")
    ui_result: Optional[Dict[str, Any]] = Field(default=None, description="UI-friendly status and guidance (Safe for Premium UX).")