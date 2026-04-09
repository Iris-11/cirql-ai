"""
supabase_client.py — Shared Supabase client for all backend services.
Client is initialized lazily — app starts fine even without credentials.

Usage:
    from services.supabase_client import save_e1_result
"""

import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")  # service_role key — bypasses RLS

_client = None  # Lazy init — only created on first DB call


def _get_client():
    """Return the Supabase client, initializing it on first use."""
    global _client
    if _client is not None:
        return _client

    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError(
            "Supabase credentials missing. "
            "Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file."
        )

    from supabase import create_client
    _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


async def save_e1_result(listing_id: str, e1_result: dict) -> bool:
    """
    Writes the E1 VerificationResult to resale_listings.e1_result.
    Updates status to 'pending_review' if proceed=True, else 'rejected'.

    Silently skips if Supabase is not configured (safe for local dev/testing).
    Returns True on success, False on failure.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        print(f"[supabase_client] Supabase not configured — skipping save for listing {listing_id}")
        return False

    try:
        client = _get_client()
        new_status = "pending_review" if e1_result.get("proceed") else "rejected"
        client.table("resale_listings").update({
            "e1_result": e1_result,
            "status": new_status,
        }).eq("id", listing_id).execute()

        print(f"[supabase_client] Saved e1_result for listing {listing_id} → status={new_status}")
        return True
    except Exception as e:
        print(f"[supabase_client] Failed to save e1_result for {listing_id}: {e}")
        return False
