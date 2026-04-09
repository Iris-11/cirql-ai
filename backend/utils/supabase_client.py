from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

def get_supabase_client(use_admin: bool = False) -> Client:
    """
    Returns a Supabase client.
    :param use_admin: If True, uses the service_role key to bypass RLS.
    """
    url = SUPABASE_URL
    key = SUPABASE_SERVICE_ROLE_KEY if use_admin else SUPABASE_ANON_KEY
    
    if not url or not key:
        raise ValueError("Supabase URL and Key must be set in environment variables.")
        
    return create_client(url, key)

# Default client (using anon key)
supabase = get_supabase_client()
