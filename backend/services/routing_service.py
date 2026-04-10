"""
routing_service.py — Service for managing service partners and routing logic.
"""

from utils.supabase_client import supabase
from models.schemas import Partner, CategorizedPartners

async def get_categorized_partners() -> CategorizedPartners:
    """
    Fetches all active partners from the 'partners' table and groups them by type.
    """
    try:
        # Step 1: Fetch all active partners
        res = supabase.table("partners").select("*").eq("active", True).execute()
        
        data = res.data or []
        
        # Step 2: Group by type
        result = CategorizedPartners()
        
        for item in data:
            partner = Partner(**item)
            p_type = item.get("type", "").lower()
            
            if p_type == "donate":
                result.donate.append(partner)
            elif p_type == "recycle":
                result.recycle.append(partner)
                
        return result
    except Exception as e:
        print(f"[routing_service] Error fetching partners: {e}")
        return CategorizedPartners()