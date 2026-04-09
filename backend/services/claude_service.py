"""
claude_service.py — Async Claude 3 Haiku/Sonnet service for product condition grading.
"""

import json
import re
import anthropic

from backend.models.schemas import ConditionRequest, ConditionResponse
from backend.utils.constants import E2_SYSTEM_PROMPT
from backend.config import settings


def _extract_json(raw: str) -> dict:
    """
    Safely extract the first {...} block from a raw LLM response.
    Guards against preamble text like 'Here is the JSON:'.
    """
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON object found in Claude response: {raw!r}")
    return json.loads(match.group())


def _build_user_message(request: ConditionRequest) -> list:
    """
    Constructs the multimodal content block Claude 3 expects,
    incorporating all passport metadata and the specific grading rubric.
    """
    content = []
    passport = request.passport

    # Add Images (if any)
    for idx, img in enumerate(request.images, start=1):
        if not img.url and not img.photo_id:
            continue
            
        # If we had base64, we'd add it here. For now, we'll send the labels/urls as text 
        # since the current schema uses URLs and Claude 3 API for images usually requires base64/bytes.
        # Note: In a real scenario, we'd fetch the URL or handle the base64.
        # For this hackathon prototype, we'll provide the image metadata as context.
        content.append({
            "type": "text",
            "text": f"[Context: Photo {idx} - Label: {img.label or 'N/A'} - URL: {img.url or 'N/A'}]",
        })

    # Summary of Passport
    materials_str = ", ".join(passport.materials) if passport.materials else "Not specified"
    certs_str = ", ".join(passport.certifications) if passport.certifications else "None"
    ownership_str = "Unknown"
    if passport.ownership:
        ownership_str = f"{passport.ownership.number_of_owners} owner(s), last purchase: {passport.ownership.last_purchase_date}"

    rubric_str = "Standard evaluation"
    if request.grading_rubric:
        rubric_str = "\n".join([f"- {k}: {v}" for k, v in request.grading_rubric.items()])

    passport_text = (
        f"Product ID: {request.product_id or 'N/A'}\n"
        f"Product Passport:\n"
        f"  - Brand/Name: {passport.brand} {passport.product_name}\n"
        f"  - Category: {passport.category}\n"
        f"  - Age: {passport.age_in_months} months\n"
        f"  - Original Price: {passport.original_price}\n"
        f"  - Materials: {materials_str}\n"
        f"  - Origin: {passport.origin}\n"
        f"  - Certifications: {certs_str}\n"
        f"  - Usage History: {passport.usage_history}\n"
        f"  - Known Issues: {passport.known_issues}\n"
        f"  - Ownership: {ownership_str}\n\n"
        f"Grading Rubric:\n{rubric_str}\n\n"
        "Return the JSON condition report based on the evidence provided."
    )
    content.append({"type": "text", "text": passport_text})
    return content


async def generate_condition_report(request: ConditionRequest) -> ConditionResponse:
    """
    Calls Claude 3 with the product images + passport and returns a
    validated ConditionResponse Pydantic model.
    """
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    message = await client.messages.create(
        model="claude-3-haiku-20240307",   # swap to claude-3-5-sonnet for higher quality
        max_tokens=1024,
        temperature=0.1,                   # near-deterministic for factual grading
        system=E2_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": _build_user_message(request),
            }
        ],
    )

    raw_text = message.content[0].text
    parsed_dict = _extract_json(raw_text)

    # Calculate ws_approved: false if score is between 0-20, true otherwise
    score = parsed_dict.get("score", 0)
    parsed_dict["ws_approved"] = score > 20

    # Validate Claude's output against our schema
    return ConditionResponse(**parsed_dict)
