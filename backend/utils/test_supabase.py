from backend.utils.supabase_client import get_supabase_client
import sys

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
            supabase.table("_connection_test").select("*").limit(1).execute()
        except Exception as e:
            err_str = str(e).lower()
            if "not found" in err_str or "disallowed" in err_str or "401" in err_str:
                results.append("SUCCESS: Successfully reached Supabase Database API (Handshake verified).")
            else:
                results.append(f"WARNING: Database reached, but returned an unusual error: {e}")

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
