import os
import random
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv
from backend.utils.supabase_client import get_supabase_client

load_dotenv(dotenv_path='d:/Sanjana/cirql-ai/backend/.env')

def seed_pending_approvals():
    supabase = get_supabase_client(use_admin=True)
    
    # Fetch valid IDs
    passports = supabase.table('passports').select('id').limit(10).execute().data
    customers = supabase.table('customers').select('id').limit(10).execute().data
    
    if not passports or not customers:
        print("Error: No passports or customers found.")
        return

    # Sample product names to make it look realistic (though the join will pull real SKU names)
    # The join happens on SKU id, so I just need valid passports
    
    pending_data = []
    
    # 5 different scenarios
    scenarios = [
        {
            "e1": {"flags": ["Minor scratch on logo"], "authenticity_score": 0.88},
            "e2": {"tier": "Good", "report_text": "Product is in great shape overall. Minor cosmetic flaw detected on the front panel.", "suggested_price": 299.0}
        },
        {
            "e1": {"flags": ["Missing side angle photo"], "missing_angles": ["side_left"], "authenticity_score": 0.75},
            "e2": {"tier": "Fair", "report_text": "Condition is fair. Fabric shows significant wear on the armrests.", "suggested_price": 150.0}
        },
        {
            "e1": {"flags": ["Suspected fabric repair on rear"], "authenticity_score": 0.55},
            "e2": {"tier": "Fair", "report_text": "Non-original stitching detected. Restoration quality is medium.", "suggested_price": 120.0}
        },
        {
            "e1": {"flags": ["Highly authentic match"], "authenticity_score": 0.98},
            "e2": {"tier": "Excellent", "report_text": "Pristine condition. Original packaging included. Suggested for premium resale tier.", "suggested_price": 850.0}
        },
        {
            "e1": {"flags": ["Colour discrepancy vs reference (Deep Red vs Maroon)"], "authenticity_score": 0.82},
            "e2": {"tier": "Good", "report_text": "Minor fading due to sunlight on the top surface. Structure is perfectly intact.", "suggested_price": 450.0}
        }
    ]

    for i, scenario in enumerate(scenarios):
        # Pick random passport and customer
        passport = passports[i % len(passports)]
        customer = customers[i % len(customers)]
        
        # Generic photo URLs for demo
        photos = [
            f"https://placehold.co/600x400?text=Listing+{i}+Photo+1",
            f"https://placehold.co/600x400?text=Listing+{i}+Photo+2",
            f"https://placehold.co/600x400?text=Listing+{i}+Photo+3"
        ]
        
        pending_data.append({
            "passport_id": passport['id'],
            "seller_id": customer['id'],
            "status": "pending_approval",
            "photo_urls": photos,
            "e1_result": scenario['e1'],
            "e2_result": scenario['e2'],
            "confidence_score": scenario['e1']['authenticity_score'],
            "condition_tier": scenario['e2']['tier'],
            "created_at": (datetime.now() - timedelta(days=random.randint(1, 5))).isoformat()
        })

    try:
        res = supabase.table('resale_listings').insert(pending_data).execute()
        print(f"Successfully seeded {len(res.data)} pending approval listings.")
    except Exception as e:
        print(f"Error seeding data: {e}")

if __name__ == "__main__":
    seed_pending_approvals()
