"""
user_service.py — Service for fetching user profile and sustainability impact data.
"""

from utils.supabase_client import get_supabase_client
from models.schemas import UserProfile, UserImpactSummary, PurchaseHistoryItem


async def get_user_profile(email: str) -> UserProfile:
    """
    Fetches basic user profile info from the 'customers' table.
    """
    supabase = get_supabase_client(use_admin=True)
    try:
        # Fetch user profile
        res = supabase.table("customers").select("*").eq("email", email).execute()
        
        print(f"[user_service] Profile Query for {email}: {res.data}")
        if hasattr(res, 'error') and res.error:
            print(f"[user_service] Profile Query Error: {res.error}")

        if not res.data:
            # Fallback or empty profile if not found for the hackathon
            return UserProfile(email=email, name="New User", city="Unknown")
            
        return UserProfile(**res.data[0])
    except Exception as e:
        print(f"[user_service] Error fetching profile: {e}")
        return UserProfile(email=email, name="Error Loading", city="N/A")


async def get_user_impact(email: str) -> UserImpactSummary:
    """
    Calculates aggregate sustainability impact for a user.
    Logic:
    1. Find the user UUID from customers table using email.
    2. Find all passports where current_owner_id matches the user UUID.
    3. Aggregate metrics from the 'sustainability_impact' table for those passports.
    """
    supabase = get_supabase_client(use_admin=True)
    try:
        # Step 1: Find user UUID from email
        user_res = supabase.table("customers").select("id").eq("email", email).execute()
        if not user_res.data:
            return UserImpactSummary()
        
        user_uuid = user_res.data[0]["id"]

        # Step 2: Use UUID to find passports
        dpp_res = supabase.table("passports").select("id").eq("current_owner_id", user_uuid).execute()
        print(f"[user_service] Impact Step 2 (passports) for {user_uuid}: {dpp_res.data}")
        
        passport_ids = [row["id"] for row in dpp_res.data]
        tracked_count = len(passport_ids)
        
        if not passport_ids:
            return UserImpactSummary()

        # Step 3: Get sustainability records for these passports
        impact_res = supabase.table("sustainability_scores").select("*").in_("passport_id", passport_ids).execute()
        impact_data = impact_res.data
        print(f"[user_service] Impact Step 3 (sustainability_scores) for IDs {passport_ids}: {impact_data}")
        
        if not impact_data:
            return UserImpactSummary(items_tracked=tracked_count)

        # Step 4: Aggregate metrics
        total_co2 = sum(row.get("co2_avoided_kg", 0) or 0 for row in impact_data)
        total_landfill = sum(row.get("landfill_avoided_kg", 0) or 0 for row in impact_data)
        
        # Circular Impact Score (average of passport scores)
        scores = [row.get("score", 0) or 0 for row in impact_data]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Items Resold (triggered by 'resale' event)
        resold_count = sum(1 for row in impact_data if row.get("trigger_event") == "resale")

        # Heritage Level Mapping (UI requirement from Image 2)
        level = "Pioneer"
        if avg_score >= 80:
            level = "Heritage Guardian"
        elif avg_score >= 50:
            level = "Eco Specialist"
        elif avg_score >= 20:
            level = "Circular Advocate"

        return UserImpactSummary(
            circular_impact_score=int(avg_score),
            heritage_level=level,
            co2_avoided_kg=round(total_co2, 1),
            landfill_avoided_kg=round(total_landfill, 1),
            items_tracked=tracked_count,
            items_resold=resold_count
        )

    except Exception as e:
        print(f"[user_service] Error calculating impact: {e}")
        return UserImpactSummary()


async def get_purchase_history(email: str) -> list[PurchaseHistoryItem]:
    """
    Fetches the product history of the consumer from the passports table.
    Includes all passports currently owned by the user.
    """
    supabase = get_supabase_client(use_admin=True)

    # Step 1: Find user UUID
    user_res = supabase.table("customers").select("id").eq("email", email).execute()
    print(f"[user_service] History Step 1 (user): {user_res.data}")
    if not user_res.data:
        return []

    user_uuid = user_res.data[0]["id"]

    # Step 2: Fetch all passports owned by this user, joined with sku details + brand + images
    owned_res = supabase.table("passports")\
        .select("id, created_at, sustainability_score, skus(name, sku_code, category, retail_price_usd, reference_images, brands(name))")\
        .eq("current_owner_id", user_uuid)\
        .execute()
    print(f"[user_service] History Step 2 (passports): {owned_res.data}")

    history = []
    for row in owned_res.data:
        sku = row.get("skus") or {}

        # Extract brand name from nested brands relation
        brand_data = sku.get("brands") or {}
        brand = brand_data.get("name", "") if isinstance(brand_data, dict) else ""

        # Pick the best available image from reference_images dict
        ref_images = sku.get("reference_images") or {}
        image_url = (
            ref_images.get("front") or
            ref_images.get("top") or
            ref_images.get("side_left") or
            next(iter(ref_images.values()), None)
        ) if isinstance(ref_images, dict) else None

        history.append(PurchaseHistoryItem(
            passport_id=row["id"],
            product_name=sku.get("name") or "Unknown Product",
            sku_code=sku.get("sku_code") or "N/A",
            category=sku.get("category") or "N/A",
            brand=brand,
            event_type="purchase",
            purchase_date=row["created_at"],
            retail_price_usd=float(sku["retail_price_usd"]) if sku.get("retail_price_usd") else 0.0,
            sustainability_score=int(row["sustainability_score"]) if row.get("sustainability_score") else 0,
            image_url=image_url,
        ))

    return history