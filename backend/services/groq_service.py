import os
import json
from groq import Groq
from dotenv import load_dotenv

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

DONATE vs RECYCLE DECISION — apply this when tier is Good, Fair, or Poor:
- The condition summary (report_text) has the HIGHEST priority. If it says the item cannot be used,
  is non-functional, unsafe, or unusable in any way — you MUST choose recycle, regardless of tier or evidence claims.
- Evidence claims are secondary signals. If any claim mentions broken parts, structural damage,
  missing components, or safety hazards — choose recycle.
- Only choose donate if BOTH the condition summary AND all evidence claims confirm the item is
  structurally sound and fully functional. Cosmetic wear (scratches, scuffs, fading) alone is not a reason to recycle.
- A good tier score does NOT override a negative condition summary. Tier is just a starting signal.
- When in doubt, prefer donate over recycle to maximise social value.

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

    evidence_text = ""
    if evidence:
        claims = "\n".join(f"  • {e.claim} (source: {e.source})" for e in evidence)
        evidence_text = f"\nCondition evidence:\n{claims}"

    user_prompt = f"""Product to route:
- Condition tier: {tier}
- Category: {category}
- User location: {location}
- Eligible for resale: {eligible_for_resale}
- Condition summary (HIGHEST PRIORITY): {report_text}{evidence_text}

ELIGIBLE PARTNERS (choose only from this list):
{partner_list_text}

Routing instructions:
1. Read the condition summary first. If it indicates the item is non-functional, unusable, or unsafe
   in any way — immediately choose recycle. Do not let a positive tier or positive evidence claims override this.
2. If the condition summary is neutral or positive, read the evidence claims.
   Recycle if any claim mentions broken parts, structural damage, missing components, or safety issues.
   Donate if all claims confirm the item is structurally sound and wear is cosmetic only.
3. If tier is Near Mint or Excellent and eligible_for_resale is true and summary/evidence are positive, prefer resale.
4. Always pick the highest-value channel the condition actually supports: resale > donate > recycle.

Select the best partner and action. Your reason must reference the tier and at least one specific
condition detail from the summary or evidence."""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0,
        max_tokens=200,
    )

    return response.choices[0].message.content