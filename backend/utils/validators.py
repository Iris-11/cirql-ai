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
