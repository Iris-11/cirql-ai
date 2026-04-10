from typing import List, Dict, Any
from backend.utils.supabase_client import get_supabase_client

def get_resale_history() -> List[Dict[str, Any]]:
    supabase = get_supabase_client(use_admin=True)
    
    # Only include resales where passport ownership_count <= 2 (1st→2nd owner only)
    res = supabase.table('resale_listings').select(
        '*, seller:customers!resale_listings_seller_id_fkey(name), '
        'buyer:customers!resale_listings_buyer_id_fkey(name), '
        'passports(id, ownership_count, skus(name, brands(name)))'
    ).eq('status', 'sold').order('sold_at', desc=True).execute()
    
    # Filter out any 3rd+ owner transactions in Python
    data = [r for r in res.data if (r.get('passports') or {}).get('ownership_count', 0) <= 2]
    return data
