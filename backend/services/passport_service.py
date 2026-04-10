from typing import List, Dict, Any, Optional
from backend.utils.supabase_client import get_supabase_client

def get_passports_list() -> List[Dict[str, Any]]:
    supabase = get_supabase_client(use_admin=True)
    # Only show passports with max 2 owners (primary + secondary)
    res = supabase.table('passports').select(
        '*, skus(*, brands(*))'
    ).lte('ownership_count', 2).order('created_at', desc=True).execute()
    return res.data

def get_passport_details(passport_id: str) -> Optional[Dict[str, Any]]:
    supabase = get_supabase_client(use_admin=True)
    # Fetch passport with full context
    res = supabase.table('passports').select(
        '*, skus(*, brands(*)), customers!passports_current_owner_id_fkey(*)'
    ).eq('id', passport_id).execute()
    
    if not res.data:
        return None
        
    passport = res.data[0]
    
    # Optional: Fetch event history if applicable (conceptual - based on existence of a hypothetical history table)
    # For now, we return the rich passport object
    return passport
