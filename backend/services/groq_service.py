"""
groq_service.py — AI service for product condition grading using Groq (Llama 3).
"""

import json
from groq import AsyncGroq
from models.schemas import ConditionRequest, ConditionResponse
from utils.constants import GEMINI_SYSTEM_PROMPT
from config import settings
from utils.validators import extract_json_block

# Initialize Async Groq client
# Fallback to a placeholder if key is missing to avoid startup crash
_client = None
if settings.GROQ_API_KEY:
    _client = AsyncGroq(api_key=settings.GROQ_API_KEY)

def _build_user_message(request: ConditionRequest) -> str:
    """
    Constructs the text payload for Llama-3 based on the rich ProductPassport and grading rubric.
    """
    passport = request.passport
    
    # Ownership details
    ownership_str = "Unknown"
    if passport.ownership:
        ownership_str = f"{passport.ownership.number_of_owners} owner(s), last purchase: {passport.ownership.last_purchase_date}"

    # Materials and Certifications
    materials_str = ", ".join(passport.materials) if passport.materials else "Not specified"
    certs_str = ", ".join(passport.certifications) if passport.certifications else "None"

    # Grading Rubric
    rubric_str = "Standard evaluation"
    if request.grading_rubric:
        # Pydantic dict handles the conversion
        rubric_str = "\n".join([f"- {k}: {v}" for k, v in request.grading_rubric.items()])

    return (
        f"Product ID: {request.product_id or 'N/A'}\n"
        f"Submission Time: {request.submission_timestamp or 'N/A'}\n\n"
        f"Product Passport Metadata:\n"
        f"- Brand: {passport.brand or 'N/A'}\n"
        f"- Name: {passport.name or 'N/A'}\n"
        f"- Category: {passport.category or 'N/A'}\n"
        f"- Age: {passport.age_in_months} months\n"
        f"- Retail Price (USD): {passport.retail_price_usd or 'N/A'}\n"
        f"- Materials: {materials_str}\n"
        f"- Origin: {passport.origin_country or 'N/A'}\n"
        f"- Certifications: {certs_str}\n"
        f"- Usage History: {passport.usage_history or 'N/A'}\n"
        f"- Known Issues: {passport.known_issues or 'None reported'}\n"
        f"- Ownership: {ownership_str}\n\n"
        f"Grading Rubric to follow:\n{rubric_str}\n\n"
        "Analyze the product details above against the rubric and return the JSON report strictly formatted."
    )

async def generate_condition_report_groq(request: ConditionRequest) -> ConditionResponse:
    """
    Calls Groq (Llama-3) with the product passport text and returns a
    validated ConditionResponse Pydantic model.
    """
    if not _client:
        raise RuntimeError("GROQ_API_KEY is not configured in .env")

    user_prompt = _build_user_message(request)
    
    # Generate the response using Llama 3.1 8B for high speed and lower limits
    # We use json_mode for structured output reliability
    completion = await _client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": GEMINI_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2,
        max_tokens=1024,
        response_format={"type": "json_object"}
    )
    
    raw_text = completion.choices[0].message.content
    parsed_dict = json.loads(raw_text)

    # Calculate ws_approved logic matching previous implementation
    score = parsed_dict.get("score", 0)
    parsed_dict["ws_approved"] = score > 20

    # Validate against our schema
    return ConditionResponse(**parsed_dict)
