"""
gemini_service.py — Async Gemini service for product condition grading based on text only.
"""

import json
import google.generativeai as genai
from typing import Dict, Any

from backend.models.schemas import ConditionRequest, ConditionResponse
from backend.utils.constants import GEMINI_SYSTEM_PROMPT
from backend.config import settings
from backend.utils.validators import extract_json_block

# Configure Gemini with the API Key
genai.configure(api_key=settings.GEMINI_API_KEY)

def _build_user_message(request: ConditionRequest) -> str:
    """
    Constructs the text payload for Gemini based on the rich ProductPassport and grading rubric.
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
        rubric_str = "\n".join([f"- {k}: {v}" for k, v in request.grading_rubric.items()])

    return (
        f"Product ID: {request.product_id or 'N/A'}\n"
        f"Submission Time: {request.submission_timestamp or 'N/A'}\n\n"
        f"Product Passport Metadata:\n"
        f"- Brand: {passport.brand or 'N/A'}\n"
        f"- Name: {passport.product_name or 'N/A'}\n"
        f"- Category: {passport.category or 'N/A'}\n"
        f"- Age: {passport.age_in_months} months\n"
        f"- Original Price: {passport.original_price or 'N/A'}\n"
        f"- Materials: {materials_str}\n"
        f"- Origin: {passport.origin or 'N/A'}\n"
        f"- Certifications: {certs_str}\n"
        f"- Usage History: {passport.usage_history or 'N/A'}\n"
        f"- Known Issues: {passport.known_issues or 'None reported'}\n"
        f"- Ownership: {ownership_str}\n\n"
        f"Grading Rubric to follow:\n{rubric_str}\n\n"
        "Analyze the product details above against the rubric and return the JSON report."
    )

async def generate_condition_report_gemini(request: ConditionRequest) -> ConditionResponse:
    """
    Calls Google Gemini with the product passport text and returns a
    validated ConditionResponse Pydantic model.
    """
    # Use gemini-flash-latest for fast and free text-based analysis
    model = genai.GenerativeModel(
        model_name="gemini-flash-latest",
        system_instruction=GEMINI_SYSTEM_PROMPT,
        generation_config=genai.GenerationConfig(
            temperature=0.2, # Low temperature for more deterministic output
            response_mime_type="application/json", # Highly reliable JSON mode
        )
    )

    user_prompt = _build_user_message(request)
    
    # Generate the response
    response = await model.generate_content_async(user_prompt)
    
    # Extract the JSON mapping
    raw_text = response.text
    parsed_dict = extract_json_block(raw_text)

    # Validate the dictionary against our schema -> ensures keys are present
    return ConditionResponse(**parsed_dict)
