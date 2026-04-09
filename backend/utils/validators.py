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