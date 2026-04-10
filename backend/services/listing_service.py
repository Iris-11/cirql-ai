from typing import List, Dict, Any
from backend.utils.supabase_client import get_supabase_client

def get_pending_approvals() -> List[Dict[str, Any]]:
    supabase = get_supabase_client(use_admin=True)
    
    # Query resale_listings joined with passports, skus, brands, and customers
    # Supabase join syntax: table(column1, column2, other_table(col1, col2))
    res = supabase.table('resale_listings').select(
        '*, passports(*, skus(*, brands(*))), customers!resale_listings_seller_id_fkey(*)'
    ).in_('status', ['pending_approval', 'pending_review']).execute()
    
    return res.data

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
