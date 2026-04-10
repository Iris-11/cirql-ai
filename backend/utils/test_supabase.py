import requests
import os
from backend.utils.supabase_client import get_supabase_client
from backend.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

def list_tables():
    results = ["\n--- Database Schema (Tables & Views) ---"]
    try:
        url = SUPABASE_URL
        key = SUPABASE_SERVICE_ROLE_KEY
        
        if not url or not key:
            results.append("ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found.")
            return results

        headers = {
            'apikey': key,
            'Authorization': f'Bearer {key}'
        }
        
        # PostgREST root endpoint returns the OpenAPI spec with all accessible tables/views
        response = requests.get(f"{url}/rest/v1/", headers=headers)
        
        if response.status_code == 200:
            schema = response.json()
            definitions = schema.get('definitions', {})
            tables = sorted(list(definitions.keys()))
            
            if tables:
                for table in tables:
                    type_str = "(View)" if table.startswith("v_") else "(Table)"
                    results.append(f"- {table} {type_str}")
            else:
                results.append("INFO: No tables found in the public schema.")
        else:
            results.append(f"ERROR: Failed to fetch schema: {response.status_code} {response.text}")
            
    except Exception as e:
        results.append(f"ERROR: Exception while listing tables: {e}")
    
    return results

def test_connection():
    results = []
    try:
        # 1. Initialize the client
        supabase = get_supabase_client()
        results.append("SUCCESS: Supabase client initialized.")
        
        # 2. Check if we can reach the Auth API
        try:
            supabase.auth.get_session()
            results.append("SUCCESS: Successfully reached Supabase Auth API.")
        except Exception as e:
            results.append(f"ERROR: Could not reach Auth API: {e}")
            write_results(results)
            return

        # 3. List Tables
        results.extend(list_tables())

        # 4. Check 'brands' Data (using admin client to bypass RLS)
        try:
            admin_supabase = get_supabase_client(use_admin=True)
            response = admin_supabase.table("brands").select("*").execute()
            brands = response.data
            results.append(f"\nSUCCESS: Successfully reached Supabase Database API (Admin).")
            results.append(f"INFO: Found {len(brands)} brands in the 'brands' table.")
            
            if brands:
                results.append("\n--- Brands Data ---")
                for brand in brands:
                    # Print more fields if available
                    data_summary = ", ".join([f"{k}: {v}" for k, v in brand.items()])
                    results.append(f"- {data_summary}")
            else:
                results.append("INFO: 'brands' table is empty (even for Admin).")
                
        except Exception as e:
            results.append(f"ERROR: Could not read 'brands' table with admin client: {e}")

    except Exception as e:
        results.append(f"ERROR: Failed during test: {e}")
    
    write_results(results)

def write_results(results):
    with open("backend/utils/test_result.txt", "w") as f:
        f.write("\n".join(results))
    for r in results:
        print(r)

if __name__ == "__main__":
    test_connection()
