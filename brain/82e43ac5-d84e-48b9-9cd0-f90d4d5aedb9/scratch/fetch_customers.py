import os
from backend.utils.supabase_client import get_supabase_client

def fetch_customers():
    try:
        # Using admin client to bypass any RLS for this internal check
        supabase = get_supabase_client(use_admin=True)
        response = supabase.table("customers").select("*").limit(10).execute()
        
        if response.data:
            print(f"SUCCESS: Fetched {len(response.data)} customers.")
            for customer in response.data:
                print(customer)
        else:
            print("INFO: No customers found in the table.")
            
    except Exception as e:
        print(f"ERROR: Failed to fetch customers: {e}")

if __name__ == "__main__":
    fetch_customers()
