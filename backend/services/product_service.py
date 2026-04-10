from typing import List, Dict, Any
from backend.utils.supabase_client import get_supabase_client

def get_all_products() -> List[Dict[str, Any]]:
    supabase = get_supabase_client(use_admin=True)
    
    # Only show products with max 2 owners (primary + secondary)
    res = supabase.table('passports').select(
        '*, skus(*, brands(*))'
    ).lte('ownership_count', 2).order('created_at', desc=True).execute()
    
    return res.data
