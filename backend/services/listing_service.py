from typing import List, Dict, Any
from backend.utils.supabase_client import get_supabase_client

def get_pending_approvals() -> List[Dict[str, Any]]:
    supabase = get_supabase_client(use_admin=True)
    
    # Query pending listings joined with passports, skus, brands, and seller
    res = supabase.table('resale_listings').select(
        '*, passports(*, skus(*, brands(*))), customers!resale_listings_seller_id_fkey(*)'
    ).in_('status', ['pending_approval', 'pending_review']).execute()
    
    # Only include listings where the product hasn't exceeded 2 owners (1st→2nd only)
    data = [r for r in res.data if (r.get('passports') or {}).get('ownership_count', 0) <= 2]
    return data

def approve_listing(listing_id: str) -> Dict[str, Any]:
    supabase = get_supabase_client(use_admin=True)
    res = supabase.table('resale_listings').update({
        'status': 'approved', 
        'ws_decision': 'approved',
        'approved_at': 'now()'
    }).eq('id', listing_id).execute()
    return res.data[0] if res.data else {}

def reject_listing(listing_id: str) -> Dict[str, Any]:
    supabase = get_supabase_client(use_admin=True)
    res = supabase.table('resale_listings').update({
        'status': 'rejected',
        'ws_decision': 'rejected'
    }).eq('id', listing_id).execute()
    return res.data[0] if res.data else {}
