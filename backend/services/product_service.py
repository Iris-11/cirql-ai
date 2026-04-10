from typing import List, Dict, Any
from backend.utils.supabase_client import get_supabase_client

def get_all_products() -> List[Dict[str, Any]]:
    supabase = get_supabase_client(use_admin=True)
    
    # Query all passports joined with skus and brands
    res = supabase.table('passports').select(
        '*, skus(*, brands(*))'
    ).order('created_at', desc=True).execute()
    
    return res.data
