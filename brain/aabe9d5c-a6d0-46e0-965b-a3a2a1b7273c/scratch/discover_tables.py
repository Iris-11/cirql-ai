from backend.utils.supabase_client import get_supabase_client

def list_tables():
    supabase = get_supabase_client(use_admin=True)
    # Query information_schema to get table names
    response = supabase.table('brands').select("*").limit(1).execute()
    print("Connection successful. Tables discovery:")
    
    # Since I don't have a direct 'list tables' in Supabase Python client without raw SQL,
    # I'll try to guess or use potential existing tables from the mock data.
    # Tables likely: brands, skus, customers, passports, resale_listings, passport_events, sustainability_scores
    
    tables_to_check = ['brands', 'skus', 'customers', 'passports', 'resale_listings', 'passport_events', 'sustainability_scores']
    for table in tables_to_check:
        try:
            res = supabase.table(table).select("*").limit(1).execute()
            print(f"Table '{table}' exists.")
        except Exception as e:
            print(f"Table '{table}' NOT found or error: {e}")

if __name__ == "__main__":
    list_tables()
