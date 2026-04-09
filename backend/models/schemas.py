from pydantic import BaseModel, Field
from typing import List, Optional, Dict


# --- E2: AI Condition Report Schemas ---

class ProductImage(BaseModel):
    photo_id: Optional[str] = None
    url: Optional[str] = None
    label: Optional[str] = None


class OwnershipInfo(BaseModel):
    number_of_owners: Optional[int] = None
    last_purchase_date: Optional[str] = None


class ProductPassport(BaseModel):
    brand: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    age_in_months: Optional[int] = None
    original_price: Optional[float] = None
    materials: Optional[List[str]] = None
    origin: Optional[str] = None
    certifications: Optional[List[str]] = None
    usage_history: Optional[str] = None
    known_issues: Optional[str] = None
    ownership: Optional[OwnershipInfo] = None


class ConditionRequest(BaseModel):
    product_id: Optional[str] = None
    submission_timestamp: Optional[str] = None
    images: Optional[List[ProductImage]] = Field(default=[])
    passport: ProductPassport
    grading_rubric: Optional[Dict[str, str]] = None


class EvidenceItem(BaseModel):
    claim: str = Field(description="Assertion made about the product condition")
    source: str = Field(description="Specific photo label or passport field that supports the claim")


class ConditionResponse(BaseModel):
    tier: str = Field(description="Assigned grade category matching the rubric keys")
    score: float = Field(description="Precise numerical grade out of 100")
    evidence: List[EvidenceItem] = Field(description="List of sourced claims supporting the grade")
    suggested_price: float = Field(description="Recommended resale price in same currency as original_price")
    report_text: str = Field(description="Professional 2-3 sentence condition summary")
    eligible_for_resale: bool = Field(description="Whether item qualifies for resale")
    ws_approved: bool = Field(description="True if score > 20, False otherwise")