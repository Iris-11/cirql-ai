"""
e1e2_pipeline.py — Combined E1 + E2 pipeline service.

Runs E1 (image verification) first, then feeds its findings into E2
(condition grading) as enriched context. Both individual results are
returned so callers can consume them separately or together.
"""

from models.schemas import (
    ProductSubmission,
    ConditionRequest,
    FullAssessmentResult,
)
from services.e1_service import verify_product
from services.e2_service import generate_condition_report_e2


async def run_full_assessment(submission: ProductSubmission) -> FullAssessmentResult:
    """
    Pipeline:
      1. Run E1 on the ProductSubmission.
      2. Build a ConditionRequest, enriching passport.known_issues with
         any damage E1 detected via vision.
      3. Run E2 on the enriched ConditionRequest.
      4. Return FullAssessmentResult with both outputs.
    """

    # ── Step 1: E1 verification ───────────────────────────────────────────────
    e1_result = await verify_product(submission)

    # ── Step 2: Enrich passport with E1 damage findings ───────────────────────
    enriched_passport = submission.passport.model_copy()
    if e1_result.damage_detected and e1_result.damage_summary:
        existing = enriched_passport.known_issues or ""
        if e1_result.damage_summary not in existing:
            enriched_passport.known_issues = (
                f"{existing}; {e1_result.damage_summary}".strip("; ")
            )

    # Convert GradingRubric model → plain dict expected by ConditionRequest
    grading_rubric_dict = (
        submission.grading_rubric.model_dump() if submission.grading_rubric else None
    )

    condition_request = ConditionRequest(
        product_id=submission.product_id,
        submission_timestamp=submission.submission_timestamp,
        passport=enriched_passport,
        grading_rubric=grading_rubric_dict,
    )

    # ── Step 3: E2 condition grading ──────────────────────────────────────────
    e2_result = await generate_condition_report_e2(condition_request)

    # ── Step 4: Override ws_approved / eligible_for_resale using E1 confidence ─
    # ws_approved: only near_mint or excellent AND E1 confidence >= threshold
    # eligible_for_resale: any passing tier AND E1 confidence >= threshold
    _CONFIDENCE_THRESHOLD = 0.7
    _WS_APPROVED_TIERS = {"near_mint", "excellent"}

    ws_approved = (
        e2_result.tier in _WS_APPROVED_TIERS
        and e1_result.confidence_score >= _CONFIDENCE_THRESHOLD
    )
    eligible_for_resale = (
        e2_result.tier != "not_eligible"
        and e1_result.confidence_score >= _CONFIDENCE_THRESHOLD
    )
    e2_result = e2_result.model_copy(
        update={"ws_approved": ws_approved, "eligible_for_resale": eligible_for_resale}
    )

    return FullAssessmentResult(e1_result=e1_result, e2_result=e2_result)
