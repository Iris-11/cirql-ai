from typing import Optional
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

def get_supabase_client(use_admin: bool = False) -> Client:
    """
    Returns a Supabase client.
    :param use_admin: If True, uses the service_role key to bypass RLS.
    """
    url = SUPABASE_URL
    key = SUPABASE_SERVICE_ROLE_KEY if use_admin else SUPABASE_ANON_KEY
    
    if not url or not key:
        raise ValueError("Supabase URL and Key must be set in environment variables.")
        
    return create_client(url, key)

# Default client (using anon key)
supabase = get_supabase_client()


async def save_e1_result(listing_id: str, e1_result: dict) -> bool:
    """
    Writes the E1 VerificationResult to resale_listings.e1_result.
    Updates status to 'pending_review' if proceed=True, else 'rejected'.
    
    Returns True on success, False on failure.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print(f"[supabase_client] Supabase credentials missing — skipping save for listing {listing_id}")
        return False

    try:
        # Use admin client to bypass RLS for updating resale_listings
        client = get_supabase_client(use_admin=True)
        new_status = "pending_review" if e1_result.get("proceed") else "rejected"
        
        client.table("resale_listings").update({
            "e1_result": e1_result,
            "status": new_status,
        }).eq("id", listing_id).execute()

        print(f"[supabase_client] Saved e1_result for listing {listing_id} -> status={new_status}")
        return True
    except Exception as e:
        print(f"[supabase_client] Failed to save e1_result for {listing_id}: {e}")
        return False
