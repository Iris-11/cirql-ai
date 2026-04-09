/**
 * CIRQL Mock Data Engine
 * Aligned with Relational Schema for Circular Economy Tracking
 */

// 1. Reference Entities
export const Brands = [
  { id: 'b1', code: 'WS', name: 'Williams Sonoma' },
  { id: 'b2', code: 'PB', name: 'Pottery Barn' },
  { id: 'b3', code: 'WE', name: 'West Elm' },
];

export const SKUs = [
  { id: 'sku1', brand_id: 'b1', sku_code: 'WS-CI-SK-12', name: 'Cast Iron Skillet 12"', category: 'cookware', materials: ['Iron', 'Enamel'], origin_country: 'USA', avg_lifespan_months: 600, retail_price_usd: 120 },
  { id: 'sku2', brand_id: 'b2', sku_code: 'PB-LN-SF-2S', name: 'Linen Sofa 2-Seat', category: 'furniture', materials: ['Linen', 'Pine', 'Foam'], origin_country: 'Italy', avg_lifespan_months: 120, retail_price_usd: 2400 },
  { id: 'sku3', brand_id: 'b3', sku_code: 'WE-DT-CH-SET', name: 'Dining Chair Set', category: 'furniture', materials: ['Walnut', 'Steel'], origin_country: 'Vietnam', avg_lifespan_months: 180, retail_price_usd: 800 },
  { id: 'sku4', brand_id: 'b1', sku_code: 'WS-CS-5QT', name: 'Casserole 5Qt', category: 'cookware', materials: ['Ceramic'], origin_country: 'France', avg_lifespan_months: 360, retail_price_usd: 180 },
];

export const Customers = [
  { id: 'c1', name: 'Sarah Jenkins', city: 'San Francisco', store_credit_usd: 45.0, reward_points: 1200, green_badges: 3, is_secondary_buyer: false },
  { id: 'c2', name: 'Michael Chen', city: 'Brooklyn', store_credit_usd: 120.0, reward_points: 3400, green_badges: 5, is_secondary_buyer: true },
  { id: 'c3', name: 'Emma Watson', city: 'Austin', store_credit_usd: 0, reward_points: 800, green_badges: 2, is_secondary_buyer: true },
];

// 2. Core Entities
export const Passports = [
  { id: 'p1', sku_id: 'sku1', current_owner_id: 'c2', ownership_count: 2, status: 'active', sustainability_score: 91, condition_tier: 'Excelllent', dpp_compliant: true, created_at: '2024-01-15' },
  { id: 'p2', sku_id: 'sku2', current_owner_id: 'c1', ownership_count: 1, status: 'active', sustainability_score: 84, condition_tier: 'Good', dpp_compliant: true, created_at: '2024-02-10' },
  { id: 'p3', sku_id: 'sku3', current_owner_id: null, ownership_count: 0, status: 'recycled', sustainability_score: 68, condition_tier: 'Fair', dpp_compliant: true, created_at: '2024-03-05' },
  { id: 'p4', sku_id: 'sku4', current_owner_id: 'c3', ownership_count: 3, status: 'active', sustainability_score: 95, condition_tier: 'Excellent', dpp_compliant: true, created_at: '2024-01-20' },
];

// 3. Transactions & Lifecycle
export const ResaleListings = [
  { id: 'rl1', passport_id: 'p1', seller_id: 'c1', status: 'sold', condition_tier: 'Excellent', listed_price_usd: 85, sold_price_usd: 80, buyer_id: 'c2', created_at: '2024-03-01', sold_at: '2024-03-05' },
  { id: 'rl2', passport_id: 'p4', seller_id: 'c2', status: 'sold', condition_tier: 'Excellent', listed_price_usd: 110, sold_price_usd: 105, buyer_id: 'c3', created_at: '2024-03-10', sold_at: '2024-03-15' },
  { id: 'rl3', passport_id: 'p2', seller_id: 'c1', status: 'approved', condition_tier: 'Good', listed_price_usd: 1800, sold_price_usd: null, buyer_id: null, created_at: '2024-04-01' },
];

export const PassportEvents = [
  { id: 'e1', passport_id: 'p1', event_type: 'manufactured', location: 'USA', distance_km: 0, created_at: '2023-12-01' },
  { id: 'e2', passport_id: 'p1', event_type: 'sold', actor_id: 'c1', location: 'San Francisco', distance_km: 450, created_at: '2024-01-20' },
  { id: 'e3', passport_id: 'p1', event_type: 'resale_sold', actor_id: 'c2', location: 'Brooklyn', distance_km: 4100, created_at: '2024-03-05' },
];

// 4. AI & Sustainability Outputs
export const SustainabilityScores = [
  { id: 'ss1', passport_id: 'p1', score: 91, score_delta: 12, co2_avoided_kg: 14.5, landfill_avoided_kg: 8.2, months_extended: 24, narrative: 'Resale successfully extended the lifecycle by 2 years.' },
  { id: 'ss2', passport_id: 'p4', score: 95, score_delta: 15, co2_avoided_kg: 22.1, landfill_avoided_kg: 12.0, months_extended: 36, narrative: 'Multiple ownership transfers significantly reduced manufacturing footprint per owner.' },
];

/**
 * Derived Dashboard Metrics Utility
 */
export const getDashboardStats = () => {
  const totalPassports = Passports.length;
  const dppCompliant = Passports.filter(p => p.dpp_compliant).length;
  const complianceRate = ((dppCompliant / totalPassports) * 100).toFixed(1);

  const totalCO2Avoided = SustainabilityScores.reduce((sum, s) => sum + s.co2_avoided_kg, 0);
  const totalResaleRevenue = ResaleListings.filter(rl => rl.status === 'sold').reduce((sum, rl) => sum + rl.sold_price_usd, 0);

  const secondaryBuyersCount = Customers.filter(c => c.is_secondary_buyer).length;
  const avgScore = (Passports.reduce((sum, p) => sum + p.sustainability_score, 0) / totalPassports).toFixed(0);
  
  return {
    metrics: [
      { id: 'active-passports', label: 'Active Passports', value: '1,284', subtext: 'across all brands', trend: '12', color: 'emerald' },
      { id: 'resales-completed', label: 'Resales Completed', value: '312', subtext: '+28% vs last quarter', trend: '24', color: 'emerald' },
      { id: 'co2-saved', label: 'CO2 Saved (kg)', value: '2,847', subtext: 'vs buying new', trend: '15', color: 'emerald' },
      { id: 'avg-score', label: 'Avg Product Score', value: `${avgScore}/100`, subtext: 'sustainability score', trend: '4', color: 'emerald' },
      { id: 'new-customers', label: 'New Customers', value: '186', subtext: 'via resale, zero cost', trend: '18', color: 'emerald' },
      { id: 'store-credit', label: 'Store Credit Issued', value: '$14,200', subtext: 'redeemed this quarter', trend: '8', color: 'red', isDown: true },
    ],
    complianceRate,
    totalCO2Avoided: totalCO2Avoided.toFixed(1),
    totalResaleRevenue: totalResaleRevenue.toLocaleString(),
    activeAssets: totalPassports,
    secondaryBuyersCount,
    avgScore
  };
};

export const resaleActivityData = [
  { name: 'Jan', value: 18 },
  { name: 'Feb', value: 24 },
  { name: 'Mar', value: 19 },
  { name: 'Apr', value: 32 },
  { name: 'May', value: 28 },
  { name: 'Jun', value: 41 },
  { name: 'Jul', value: 38 },
  { name: 'Aug', value: 52 },
  { name: 'Sep', value: 48 },
];

export const scoreDistribution = [
  { label: '90 – 100 Excellent', percentage: 22, count: 283, color: 'var(--color-brand-accent)' },
  { label: '75 – 89 Good', percentage: 38, count: 488, color: '#82CA9D' },
  { label: '60 – 74 Fair', percentage: 28, count: 360, color: 'var(--color-brand-warning)' },
  { label: 'Below 60 Needs care', percentage: 12, count: 154, color: 'var(--color-brand-danger)' },
];

export const brandDistribution = [
  { brand: 'Williams Sonoma', count: 421, percentage: 33 },
  { brand: 'Pottery Barn', count: 318, percentage: 25 },
  { brand: 'West Elm', count: 284, percentage: 22 },
  { brand: 'PB Kids', count: 156, percentage: 12 },
  { brand: 'Other brands', count: 105, percentage: 8 },
];

export const lifecycleDataStats = [
  { stage: 'Active (1st owner)', count: 782, color: 'var(--color-brand-accent)' },
  { stage: '2nd life (resold)', count: 312, color: '#64748B' },
  { stage: '3rd+ life', count: 89, color: '#94A3B8' },
  { stage: 'Recycled', count: 101, color: '#CBD5E1' },
];

export const rewardActivityData = [
  { label: 'Total points issued', value: '284,000 pts' },
  { label: 'Store credit redeemed', value: '$14,200' },
  { label: 'Charity donations', value: '$2,840' },
  { label: 'Green badges awarded', value: '101' },
  { label: 'Avg pts per customer', value: '221 pts' },
];
