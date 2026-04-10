import requests
from backend.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

def list_customer_columns():
    url = SUPABASE_URL
    key = SUPABASE_SERVICE_ROLE_KEY
    
    headers = {
        'apikey': key,
        'Authorization': f'Bearer {key}'
    }
    
    try:
        response = requests.get(f"{url}/rest/v1/", headers=headers)
        if response.status_code == 200:
            schema = response.json()
            customer_def = schema.get('definitions', {}).get('customers', {})
            properties = customer_def.get('properties', {})
            
            if properties:
                print("Columns in 'customers' table:")
                for col, details in properties.items():
                    col_type = details.get('type', 'unknown')
                    col_format = details.get('format', '')
                    description = details.get('description', '')
                    print(f"- {col} ({col_type}{' ' + col_format if col_format else ''}): {description}")
            else:
                print("Could not find table 'customers' in schema definitions.")
        else:
            print(f"Error fetching schema: {response.status_code}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    list_customer_columns()
