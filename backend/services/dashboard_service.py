from typing import Dict, Any, List
from backend.utils.supabase_client import get_supabase_client
from datetime import datetime, timedelta

def get_dashboard_metrics(selected_year: int = None) -> Dict[str, Any]:
    supabase = get_supabase_client(use_admin=True)
    
    # Pre-fetch all sold resale listings to determine available years and activity data
    resale_activity_res = supabase.table('resale_listings').select('sold_at').eq('status', 'sold').execute()
    
    activity_data = {}
    years_found = set()
    for item in resale_activity_res.data:
        if item['sold_at']:
            # Parse YYYY-MM-DD
            year_val = item['sold_at'][:4]
            years_found.add(int(year_val))
            month = item['sold_at'][:7] # YYYY-MM
            activity_data[month] = activity_data.get(month, 0) + 1
            
    available_years = sorted(list(years_found), reverse=True)
    current_year = datetime.now().year
    
    # Determine the target year: if selected, use it. Otherwise use the latest available, or current year.
    target_year = selected_year if selected_year else (available_years[0] if available_years else current_year)

    # 1. Basic Metrics
    # Active Passports (All time active)
    active_passports_res = supabase.table('passports').select('id', count='exact').eq('status', 'active').execute()
    active_passports_count = active_passports_res.count or 0
    
    # Resales Completed (Filtered by year)
    # Filter soldier_at string for the target_year
    resales_in_year = [r for r in resale_activity_res.data if r['sold_at'] and r['sold_at'].startswith(str(target_year))]
    resales_completed_count = len(resales_in_year)
    
    # CO2 Saved (All time or per year? Let's keep all time for the high-level metrics, but filter by year if we want to be specific.
    # The user asked specifically about the graph, but let's make the "Resales Completed" card follow the year too.
    co2_saved_res = supabase.table('sustainability_scores').select('co2_avoided_kg').execute()
    total_co2_saved = sum(item['co2_avoided_kg'] for item in co2_saved_res.data) if co2_saved_res.data else 0
    
    # Avg Product Score
    avg_score_res = supabase.table('passports').select('sustainability_score').execute()
    scores = [item['sustainability_score'] for item in avg_score_res.data if item['sustainability_score'] is not None]
    avg_score = sum(scores) / len(scores) if scores else 0
    
    # New Customers (Secondary Buyers) - All time
    new_customers_res = supabase.table('customers').select('id', count='exact').eq('is_secondary_buyer', True).execute()
    new_customers_count = new_customers_res.count or 0
    
    # Pending Approvals
    pending_approvals_res = supabase.table('resale_listings').select('id', count='exact').in_('status', ['pending_approval', 'pending_review']).execute()
    pending_approvals_count = pending_approvals_res.count or 0
    
    # Store Credit Issued - All time
    store_credit_res = supabase.table('customers').select('store_credit_usd').execute()
    total_store_credit = sum(item['store_credit_usd'] for item in store_credit_res.data) if store_credit_res.data else 0
    
    # 2. Resale Activity (Monthly) for the TARGET year
    months_map = {'01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', 
                 '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'}
    
    resale_activity_chart = []
    for m in range(1, 13):
        m_str = f"{target_year}-{m:02d}"
        resale_activity_chart.append({
            "name": months_map[f"{m:02d}"],
            "value": activity_data.get(m_str, 0)
        })

    # (Rest of the metrics remain largely same as they are "all time" totals)
    # ... (I'll keep the rest of the existing code logic below for distributions and tables)

    # 3. Score Distribution
    score_dist = [
        {"label": "90 – 100 Excellent", "percentage": 0, "count": 0, "color": "var(--color-brand-accent)"},
        {"label": "75 – 89 Good", "percentage": 0, "count": 0, "color": "#82CA9D"},
        {"label": "60 – 74 Fair", "percentage": 0, "count": 0, "color": "var(--color-brand-warning)"},
        {"label": "Below 60 Needs care", "percentage": 0, "count": 0, "color": "var(--color-brand-danger)"}
    ]
    total_passports = len(scores)
    for s in scores:
        if s >= 90: score_dist[0]["count"] += 1
        elif s >= 75: score_dist[1]["count"] += 1
        elif s >= 60: score_dist[2]["count"] += 1
        else: score_dist[3]["count"] += 1
    
    if total_passports > 0:
        for item in score_dist:
            item["percentage"] = round((item["count"] / total_passports) * 100)

    # 4. Brand Distribution
    # Passports -> SKUs -> Brands
    # We'll fetch all passports with their sku info
    brand_dist_res = supabase.table('passports').select('id, skus(brand_id, brands(name))').execute()
    brand_counts = {}
    for item in brand_dist_res.data:
        brand_name = item.get('skus', {}).get('brands', {}).get('name', 'Other')
        brand_counts[brand_name] = brand_counts.get(brand_name, 0) + 1
    
    total_p = sum(brand_counts.values()) or 1
    brand_distribution = []
    for name, count in brand_counts.items():
        brand_distribution.append({
            "brand": name,
            "count": count,
            "percentage": round((count / total_p) * 100)
        })

    # 5. Lifecycle Data (max 2 owners per policy)
    lifecycle_data = [
        {"stage": "Active (1st owner)", "count": 0, "color": "var(--color-brand-accent)"},
        {"stage": "2nd life (resold)", "count": 0, "color": "#64748B"},
        {"stage": "Recycled", "count": 0, "color": "#CBD5E1"}
    ]
    lifecycle_res = supabase.table('passports').select('status, ownership_count').lte('ownership_count', 2).execute()
    for item in lifecycle_res.data:
        if item['status'] == 'recycled':
            lifecycle_data[2]["count"] += 1
        else:
            occ = item['ownership_count'] or 1
            if occ == 1: lifecycle_data[0]["count"] += 1
            else: lifecycle_data[1]["count"] += 1

    # 6. Reward Activity
    reward_points_res = supabase.table('customers').select('reward_points, store_credit_usd, green_badges').execute()
    total_points = sum(item['reward_points'] for item in reward_points_res.data) if reward_points_res.data else 0
    total_badges = sum(item['green_badges'] for item in reward_points_res.data) if reward_points_res.data else 0
    avg_pts = total_points / len(reward_points_res.data) if reward_points_res.data else 0
    
    reward_activity = [
        {"label": "Total points issued", "value": f"{total_points:,} pts"},
        {"label": "Store credit issued", "value": f"${total_store_credit:,.0f}"},
        {"label": "Charity donations", "value": f"${(total_points * 0.01):,.0f}"}, # Mock rule
        {"label": "Green badges awarded", "value": str(total_badges)},
        {"label": "Avg pts per customer", "value": f"{avg_pts:.0f} pts"}
    ]

    # 7. Recent Passports (only 1st and 2nd owners)
    recent_passports_res = supabase.table('passports')\
        .select('id, sustainability_score, created_at, status, ownership_count, skus(name, brands(code))')\
        .lte('ownership_count', 2)\
        .order('created_at', desc=True)\
        .limit(10)\
        .execute()
    
    passport_activity = []
    for p in recent_passports_res.data:
        owner_label = "1st owner" if (p['ownership_count'] or 1) == 1 else "2nd owner"
        passport_activity.append({
            "id": p['id'],
            "product": p.get('skus', {}).get('name', 'Unknown'),
            "brand_code": p.get('skus', {}).get('brands', {}).get('code', '??'),
            "status": p['status'],
            "owner": owner_label,
            "score": p['sustainability_score'],
            "date": p['created_at']
        })

    # 8. Compliance Status
    dpp_compliant_res = supabase.table('passports').select('id', count='exact').eq('dpp_compliant', True).execute()
    dpp_count = dpp_compliant_res.count or 0
    compliance_rate = (dpp_count / total_passports * 100) if total_passports > 0 else 100

    return {
        "metrics": [
            {"id": "active-passports", "label": "Active Passports", "value": f"{active_passports_count:,}", "subtext": "across all brands", "trend": "12", "color": "emerald"},
            {"id": "resales-completed", "label": "Resales Completed", "value": str(resales_completed_count), "subtext": "+28% vs last quarter", "trend": "24", "color": "emerald"},
            {"id": "co2-saved", "label": "CO2 Saved (kg)", "value": f"{total_co2_saved:,.0f}", "subtext": "vs buying new", "trend": "15", "color": "emerald"},
            {"id": "avg-score", "label": "Avg Product Score", "value": f"{avg_score:.0f}/100", "subtext": "sustainability score", "trend": "4", "color": "emerald"},
            {"id": "pending-approvals", "label": "Pending Approvals", "value": str(pending_approvals_count), "subtext": "manual review required", "trend": str(pending_approvals_count), "color": "gold"},
            {"id": "store-credit", "label": "Store Credit Issued", "value": f"${total_store_credit:,.0f}", "subtext": "redeemed this quarter", "trend": "12", "color": "emerald", "isDown": False}
        ],
        "resaleActivityData": resale_activity_chart,
        "scoreDistribution": score_dist,
        "brandDistribution": brand_distribution,
        "lifecycleDataStats": lifecycle_data,
        "rewardActivityData": reward_activity,
        "passports": passport_activity,
        "resaleYear": target_year,
        "availableYears": available_years,
        "compliance": {
            "dpp_ready": dpp_count,
            "rate": round(compliance_rate, 1)
        }
    }
