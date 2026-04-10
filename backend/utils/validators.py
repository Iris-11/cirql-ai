"""
validators.py — Reusable utility helpers for parsing and validating LLM output.
"""

import json
import re


def extract_json_block(text: str) -> dict:
    """
    Extracts the first valid JSON object from a string.

    LLMs sometimes wrap responses in markdown code fences or add preamble
    text (e.g. "Here is the JSON:"). This function strips all of that and
    returns a plain Python dict.

    Raises:
        ValueError: if no valid JSON object is found in the text.
        json.JSONDecodeError: if the extracted block is malformed JSON.
    """
    # Remove markdown fences (```json ... ```) if present
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fenced:
        return json.loads(fenced.group(1))

    # Fall back to the first bare { ... } block
    brace_match = re.search(r"\{.*\}", text, re.DOTALL)
    if brace_match:
        return json.loads(brace_match.group())

    raise ValueError(
        f"No JSON object found in LLM response. Raw output:\n{text!r}"
    )


def validate_base64_image(value: str) -> bool:
    """
    Basic sanity check: a base64 image string should only contain
    alphanumeric chars, +, /, and = padding.
    """
    import base64
    try:
        # Allow optional data URI prefix (data:image/jpeg;base64,...)
        if "," in value:
            value = value.split(",", 1)[1]
        base64.b64decode(value, validate=True)
        return True
    except Exception:
        return False

import json
from utils.constants import PARTNERS

VALID_ACTIONS = {"resale", "donate", "recycle"}

def validate_ai_response(ai_output: str) -> dict:
    """
    Parse and validate Groq's JSON response.
    Raises ValueError with a descriptive message on any failure.
    """
    # Strip markdown fences the model occasionally adds
    cleaned = ai_output.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"AI response is not valid JSON: {e}. Raw output: {ai_output[:200]}")

    # Validate action
    action = data.get("action", "")
    if action not in VALID_ACTIONS:
        raise ValueError(f"Invalid action '{action}'. Must be one of {VALID_ACTIONS}")

    # Validate partner
    valid_partners = {p["name"]: p for p in PARTNERS}
    partner = data.get("partner", "")
    if partner not in valid_partners:
        raise ValueError(
            f"AI returned unknown partner '{partner}'. "
            f"Valid partners: {list(valid_partners.keys())}"
        )

    # Cross-field consistency: action must match partner type
    partner_type = valid_partners[partner].get("type")
    if partner_type and partner_type != action:
        raise ValueError(
            f"Action '{action}' is inconsistent with partner type '{partner_type}' "
            f"for partner '{partner}'"
        )

    # Validate reason exists and is non-empty
    if not data.get("reason", "").strip():
        raise ValueError("AI response missing 'reason' field")

    return data
