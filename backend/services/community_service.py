"""
community_service.py — Community-level aggregate metrics for the home screen.

Metrics follow the same logic as the dashboard:
  - CO2 Saved: all-time cumulative from sustainability_scores
  - Landfill Diverted: all-time cumulative from sustainability_scores
  - Items Rehomed: all-time count of sold resale listings
  - Resales This Year: sold listings filtered to the current calendar year
  - Active Members: total customer count
  - Donations + Recycles: transferred passports grouped by e3 action
"""

from datetime import datetime
from utils.supabase_client import get_supabase_client


async def get_community_stats() -> dict:
    supabase = get_supabase_client(use_admin=True)
    current_year = str(datetime.utcnow().year)

    # ── CO2 + Landfill (all-time from sustainability_scores) ──────────────────
    scores_res = supabase.table("sustainability_scores")\
        .select("co2_avoided_kg, landfill_avoided_kg")\
        .execute()
    scores = scores_res.data or []

    total_co2_saved_kg = round(
        sum(row.get("co2_avoided_kg") or 0 for row in scores), 1
    )
    total_landfill_diverted_kg = round(
        sum(row.get("landfill_avoided_kg") or 0 for row in scores), 1
    )

    # ── Resale listings (sold) ────────────────────────────────────────────────
    resale_res = supabase.table("resale_listings")\
        .select("sold_at")\
        .eq("status", "sold")\
        .execute()
    all_sold = resale_res.data or []

    # All-time rehomed count
    total_items_rehomed = len(all_sold)

    # Current-year resales (dashboard logic: filter by sold_at year prefix)
    resales_this_year = sum(
        1 for r in all_sold
        if r.get("sold_at") and str(r["sold_at"]).startswith(current_year)
    )

    # ── Active members (all customers) ───────────────────────────────────────
    members_res = supabase.table("customers")\
        .select("id", count="exact")\
        .execute()
    total_members_active = members_res.count or len(members_res.data or [])

    # ── Donations + Recycles (passports with status = 'transferred') ─────────
    transferred_res = supabase.table("passports")\
        .select("id", count="exact")\
        .eq("status", "transferred")\
        .execute()
    total_transferred = transferred_res.count or len(transferred_res.data or [])

    return {
        "total_co2_saved_kg": total_co2_saved_kg,
        "total_landfill_diverted_kg": total_landfill_diverted_kg,
        "total_items_rehomed": total_items_rehomed,
        "resales_this_year": resales_this_year,
        "total_members_active": total_members_active,
        "total_donated_recycled": total_transferred,
    }
