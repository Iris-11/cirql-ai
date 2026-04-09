# Add schemas for response
from pydantic import BaseModel
from typing import Literal

class EvidenceItem(BaseModel):
    claim: str
    source: str


class ConditionReport(BaseModel):
    tier: str
    score: int
    evidence: list[EvidenceItem]
    suggested_price: float
    report_text: str
    eligible_for_resale: bool

class RoutingRequest(BaseModel):
    product_id: str
    category: str
    weight: float
    location: str
    condition_report: ConditionReport

class Impact(BaseModel):
    co2_avoided_kg: float
    landfill_diverted_kg: float


class RoutingResponse(BaseModel):
    action: Literal["resale", "donate", "recycle"]
    partner: str
    reason: str
    impact: Impact