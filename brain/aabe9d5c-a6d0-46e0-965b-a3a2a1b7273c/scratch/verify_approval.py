import os
import sys
from dotenv import load_dotenv

sys.path.append('d:/Sanjana/cirql-ai')
load_dotenv(dotenv_path='d:/Sanjana/cirql-ai/backend/.env')

from backend.services.listing_service import get_pending_approvals, approve_listing
from backend.utils.supabase_client import get_supabase_client

def verify():
    supabase = get_supabase_client(use_admin=True)
    pending = get_pending_approvals()
    
    if not pending:
        print("No pending listings found.")
        return

    listing = pending[0]
    lid = listing['id']
    print(f"Approving listing: {lid} ({listing.get('passports', {}).get('skus', {}).get('name')})")
    
    approve_listing(lid)
    
    # Check Result
    res = supabase.table('resale_listings').select('status, ws_decision, approved_at').eq('id', lid).execute()
    if res.data:
        print(f"Verification Success: {res.data[0]}")
    else:
        print("Failed to retrieve listing after approval.")

if __name__ == "__main__":
    verify()
