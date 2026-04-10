from utils.supabase_client import get_supabase_client
import sys
import os

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

        # 3. Check Database Connection
        try:
            # Try to query a common table or just a handshake
            # We use a dummy table name to verify the API responds (handshake)
            supabase.table("_connection_test").select("*").limit(1).execute()
        except Exception as e:
            err_str = str(e).lower()
            # If the error is 'relation "..." does not exist' or '401', it means we reached the DB
            if "not found" in err_str or "disallowed" in err_str or "401" in err_str or "404" in err_str:
                results.append("SUCCESS: Successfully reached Supabase Database API (Handshake verified).")
            else:
                results.append(f"WARNING: Database reached, but returned an unusual error: {e}")

    except Exception as e:
        results.append(f"ERROR: Failed during test: {e}")
    
    write_results(results)

def write_results(results):
    # Ensure we write to the utils directory relative to this script
    output_path = os.path.join(os.path.dirname(__file__), "test_result.txt")
    with open(output_path, "w") as f:
        f.write("\n".join(results))
    for r in results:
        print(r)

if __name__ == "__main__":
    test_connection()
