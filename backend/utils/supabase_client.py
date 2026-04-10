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


def create_listing(passport_id: str, seller_id: str, photo_urls: list) -> Optional[str]:
    """
    Creates a new row in resale_listings for this submission.
    Returns the new listing id, or None on failure.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("[supabase_client] Supabase credentials missing — skipping create_listing")
        return None
    try:
        client = get_supabase_client(use_admin=True)
        result = client.table("resale_listings").insert({
            "passport_id": passport_id,
            "seller_id": seller_id,
            "photo_urls": photo_urls,
            "status": "pending_review",
        }).execute()
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        print(f"[supabase_client] Failed to create listing: {e}")
        return None


def save_full_assessment(listing_id: str, e1_result: dict, e2_result: dict,
                         e3_result: Optional[dict], confidence_score: float,
                         pending_review: bool) -> bool:
    """
    Saves E1, E2, E3 results + confidence_score + status to resale_listings.
    Status: 'pending_review' if pending_review=True, else 'approved'/'rejected'
    based on eligible_for_resale.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return False
    try:
        client = get_supabase_client(use_admin=True)
        if pending_review:
            # Low confidence — sent to admin for manual approval
            status = "pending_approval"
        else:
            # Confidence passed — awaiting user's action choice (resale / donate / recycle)
            status = "pending_review"

        payload = {
            "e1_result": e1_result,
            "e2_result": e2_result,
            "e3_result": e3_result,
            "confidence_score": confidence_score,
            "status": status,
            "condition_tier": e2_result.get("tier"),
            "listed_price_usd": e2_result.get("suggested_price"),
        }
        client.table("resale_listings").update(payload).eq("id", listing_id).execute()
        print(f"[supabase_client] Saved full assessment for listing {listing_id} -> status={status}")
        return True
    except Exception as e:
        print(f"[supabase_client] Failed to save full assessment for {listing_id}: {e}")
        return False


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


def confirm_listing_action(listing_id: str, action: str) -> bool:
    """
    Finalizes the user's chosen action (resale / donate / recycle).
    Updates resale_listings.status and passports.status accordingly.
    Returns True on success.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return False
    try:
        client = get_supabase_client(use_admin=True)

        # Map action to listing status
        listing_status = {
            "resale":   "listed",
            "donate":   "approved",
            "recycle":  "approved",
        }.get(action, "approved")

        # Map action to passport status
        passport_status = {
            "resale":   "listed",       # still listed — awaiting buyer
            "donate":   "transferred",  # donated away
            "recycle":  "transferred",  # recycled
        }.get(action, "transferred")

        # Get passport_id from listing
        listing = client.table("resale_listings").select("passport_id").eq("id", listing_id).single().execute()
        passport_id = listing.data.get("passport_id") if listing.data else None

        # Update listing status
        client.table("resale_listings").update({
            "status": listing_status,
        }).eq("id", listing_id).execute()

        # Update passport status
        if passport_id:
            client.table("passports").update({"status": passport_status}).eq("id", passport_id).execute()
            print(f"[supabase_client] Passport {passport_id} -> {passport_status}")

        print(f"[supabase_client] Confirmed action '{action}' for listing {listing_id} -> {listing_status}")
        return True
    except Exception as e:
        print(f"[supabase_client] Failed to confirm action for {listing_id}: {e}")
        return False
