import os
import json
import logging
from groq import Groq
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

TIER_HIERARCHY = ["Near Mint", "Excellent", "Good", "Fair", "Poor"]

SYSTEM_PROMPT = """You are a sustainability routing engine for a circular economy platform.
Your job is to assign returned products to the best next-life channel.

TIER MEANINGS:
- Near Mint / Excellent: product can be resold at near-retail price
- Good: usable but shows wear — best suited for donation programs
- Fair / Poor: functional value is low — route to material recovery

ROUTING LOGIC:
1. Only recommend a partner from the ELIGIBLE PARTNERS list provided.
2. Never invent partner names or types.
3. If eligible_for_resale is false, never pick a resale-type partner.
4. Pick the highest-value channel first: resale > donate > recycle.
5. Your reason must cite the tier AND explain the social or environmental benefit of the chosen channel in one sentence.

DONATE vs RECYCLE DECISION — apply this when tier is Good or Fair:
- Read BOTH the condition summary AND every evidence claim before deciding.
- Choose DONATE if the condition summary says the item is usable/functional AND no evidence claim
  mentions broken parts, structural damage, missing components, or safety hazards.
  Cosmetic wear (scratches, scuffs, fading) alone is NOT a reason to recycle — these items should be donated.
- Choose RECYCLE if the condition summary says the item is non-functional or unusable,
  OR any evidence claim mentions broken parts, structural damage, missing components, or safety hazards.
- The condition summary is the primary signal. Evidence claims are secondary but can override a positive summary.
- When in doubt between donate and recycle, prefer donate to maximise social value.

OUTPUT FORMAT — return ONLY valid JSON, no markdown, no explanation:
{"action": "resale"|"donate"|"recycle", "partner": "<name>", "reason": "<one sentence>"}"""


def _filter_eligible_partners(tier: str, category: str, partners: list, eligible_for_resale: bool) -> list:
    """Pre-filter partners deterministically before sending to AI."""
    tier_rank = TIER_HIERARCHY.index(tier) if tier in TIER_HIERARCHY else len(TIER_HIERARCHY)
    eligible = []

    for p in partners:
        if not eligible_for_resale and p.get("type") == "resale":
            continue

        cats = p.get("categories", [])
        if "all" not in cats and category.lower() not in [c.lower() for c in cats]:
            continue

        min_tier = p.get("min_tier")
        if min_tier:
            min_rank = TIER_HIERARCHY.index(min_tier) if min_tier in TIER_HIERARCHY else 0
            if tier_rank > min_rank:
                continue

        eligible.append(p)

    return eligible


def get_routing_decision(tier: str, category: str, location: str,
                         partners: list, eligible_for_resale: bool,
                         evidence: list = None, report_text: str = "") -> str:

    tier = tier.strip().title()

    eligible_partners = _filter_eligible_partners(tier, category, partners, eligible_for_resale)

    if not eligible_partners:
        recycle_partners = [p for p in partners if p.get("type") == "recycle"]
        eligible_partners = recycle_partners if recycle_partners else partners

    partner_list_text = "\n".join(
        f'- "{p["name"]}" (type: {p.get("type", "unknown")}, '
        f'accepts: {", ".join(p.get("categories", ["all"]))})'
        for p in eligible_partners
    )

    claims_text = "No evidence provided."
    if evidence:
        claims_text = "\n".join(f"  • [{e.source}] {e.claim}" for e in evidence)

    user_prompt = f"""Product to route:
- Condition tier: {tier}
- Category: {category}
- User location: {location}
- Eligible for resale: {eligible_for_resale}

CONDITION SUMMARY (overall assessor verdict):
{report_text or "Not provided."}

EVIDENCE CLAIMS (specific observations per image/field):
{claims_text}

ELIGIBLE PARTNERS (you MUST choose only from this list):
{partner_list_text}

Decision steps:
Step 1 — Tier is Near Mint or Excellent AND eligible_for_resale is true AND summary is positive → resale
Step 2 — Tier is Good or Fair → read BOTH the condition summary AND every evidence claim:
  - If the summary says the item is usable/functional AND no claim mentions broken parts,
    missing components, structural damage, or safety hazards → donate
  - If the summary says unusable/non-functional OR any claim mentions broken parts,
    structural damage, missing components, or safety hazards → recycle
  - Cosmetic defects only (scratches, scuffs, fading) = usable → donate
Step 3 — Tier is Poor, or nothing above matched → recycle

You MUST pick a partner from the ELIGIBLE PARTNERS list. Do not use any other name.
Your reason must cite the tier, a specific detail from the summary, and at least one evidence claim."""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0,
        max_tokens=200,
    )

    raw = response.choices[0].message.content
    return _correct_partner(raw, eligible_partners)


def _correct_partner(raw: str, eligible_partners: list) -> str:
    """
    If the model hallucinated a partner name not in the eligible list,
    substitute the best eligible partner deterministically and log a warning.
    """
    try:
        cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(cleaned)
    except (json.JSONDecodeError, ValueError):
        # Can't parse — let validate_ai_response handle the error downstream
        return raw

    partner_map = {p["name"]: p for p in eligible_partners}
    chosen_partner = partner_map.get(data.get("partner"))
    action_matches = chosen_partner and chosen_partner.get("type") == data.get("action")

    if chosen_partner and action_matches:
        return raw  # Partner valid and action consistent

    logger.warning(
        "E3: model returned partner '%s' (action='%s') that is invalid or inconsistent. Applying deterministic fallback.",
        data.get("partner"), data.get("action")
    )

    # Try to honour the AI's action first, then fall back by priority
    ai_action = data.get("action")
    action_priority = [ai_action] + [a for a in ["resale", "donate", "recycle"] if a != ai_action]
    chosen = None
    for action in action_priority:
        match = next((p for p in eligible_partners if p.get("type") == action), None)
        if match:
            chosen = match
            break

    if not chosen:
        chosen = eligible_partners[0]

    data["partner"] = chosen["name"]
    data["action"] = chosen.get("type", data.get("action", "recycle"))
    return json.dumps(data)