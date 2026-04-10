import traceback
import os
import sys

# Add project root to path
sys.path.append('d:/Sanjana/cirql-ai')

from dotenv import load_dotenv
load_dotenv(dotenv_path='d:/Sanjana/cirql-ai/backend/.env')

from backend.services.listing_service import get_pending_approvals

try:
    print("Attempting to fetch pending approvals...")
    data = get_pending_approvals()
    print(f"Success! Found {len(data)} records.")
    if data:
        print("Sample data keys:", data[0].keys())
except Exception:
    print("Error occurred:")
    traceback.print_exc()
