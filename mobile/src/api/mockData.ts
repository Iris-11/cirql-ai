/**
 * Mock Data — Local JSON objects simulating FastAPI backend responses.
 *
 * When real backend is ready, delete this file and update
 * the service files in ./services/ to hit real endpoints.
 */

import {
  CommunityStats,
  CommunityRehome,
  UserImpact,
  PortfolioProduct,
  VerificationResult,
  ConditionResponse,
  RoutingResponse,
  RewardsData,
  ConfirmationData,
  MarketplaceProduct,
} from "../types";

// ────────────────────────────────────────────────
// HOME — Community Stats
// ────────────────────────────────────────────────

export const mockCommunityStats: CommunityStats = {
  totalCo2SavedKg: 2_500_000,
  totalLandfillDivertedKg: 980_000,
  totalItemsRehomed: 48_320,
  resalesThisYear: 3_210,
  totalMembersActive: 12_650,
  totalDonatedRecycled: 8_740,
};

export const mockCommunityRehomes: CommunityRehome[] = [
  {
    id: "rh-001",
    productName: "Le Creuset Dutch Oven",
    brand: "Le Creuset",
    image: "https://www.foodandwine.com/thmb/WIH5WNUZbjA59j7w3sQwPqQifsA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/FAW-LeCreuset7-0368283feb0948bfa07967d943d9a690.jpeg",
    rating: 4.8,
    provenanceVerified: true,
    savedDate: "2026-04-08",
  },
  {
    id: "rh-002",
    productName: "All-Clad D5 Sauté Pan",
    brand: "All-Clad",
    image: "https://cutleryandmore.com/cdn/shop/products/39596_4e26233f-564a-4684-8153-2924c3e45cb0_900x.jpg?v=1659107113",
    rating: 4.6,
    provenanceVerified: true,
    savedDate: "2026-04-07",
  },
  {
    id: "rh-003",
    productName: "Staub Cocotte Round",
    brand: "Staub",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_l5NP5EEoY__Mk6851O4dfBM8QsKQWFD7AA&s",
    rating: 4.9,
    provenanceVerified: true,
    savedDate: "2026-04-06",
  },
  {
    id: "rh-004",
    productName: "West Elm Mid-Century Chair",
    brand: "West Elm",
    image: "https://www.westelm.com.au/site/WE/Product%20Images/mid-century-upholstered-dining-chair-velvet-h2338-alt-1-z.jpg?resizeid=53&resizeh=450&resizew=450",
    rating: 4.5,
    provenanceVerified: false,
    savedDate: "2026-04-05",
  },
];

// ────────────────────────────────────────────────
// IMPACT DASHBOARD
// ────────────────────────────────────────────────

export const mockUserImpact: UserImpact = {
  circularScore: 82,
  heritageTier: "Heritage Guardian",
  co2SavedKg: 45.8,
  treesEquivalent: 2,
  landfillAvoidedKg: 12.3,
  trackedItems: 12,
  resoldItems: 5,
};

export const mockPortfolio: PortfolioProduct[] = [
  {
    id: "prod-001",
    name: "Le Creuset Dutch Oven 5.5qt",
    brand: "Le Creuset",
    category: "cookware",
    image: "https://m.media-amazon.com/images/I/718H8+7nilL.jpg",
    sustainabilityScore: 92,
    status: "tracked",
    addedDate: "2026-03-15",
  },
  {
    id: "prod-002",
    name: "West Elm Slope Chair",
    brand: "West Elm",
    category: "furniture",
    image: "https://assets.weimgs.com/weimgs/ab/images/wcm/products/202615/0006/slope-leather-dining-chair-set-of-2-1-o.jpg",
    sustainabilityScore: 78,
    status: "listed",
    addedDate: "2026-02-20",
  },
  {
    id: "prod-003",
    name: "All-Clad D3 10in Skillet",
    brand: "All-Clad",
    category: "cookware",
    image: "https://cutleryandmore.com/cdn/shop/products/39999_54ab5ad2-4c00-4bee-84be-0b52c0911fdc_900x.jpg?v=1645043580",
    sustainabilityScore: 85,
    status: "resold",
    addedDate: "2026-01-10",
  },
  {
    id: "prod-004",
    name: "Vitamix A3500 Blender",
    brand: "Williams-Sonoma",
    category: "appliances",
    image: "https://images-cdn.ubuy.co.in/693fa22c33a9a7bfa0064530-vitamix-a3500-ascent-series-smart.jpg",
    sustainabilityScore: 65,
    status: "recycled",
    addedDate: "2025-12-05",
  },
];

// ────────────────────────────────────────────────
// VERIFICATION — E1 Result
// ────────────────────────────────────────────────

export const mockVerificationResult: VerificationResult = {
  complete: true,
  completeness_note: "All required angles captured with unique images.",
  authenticity_score: 0.94,
  missing_angles: [],
  flags: [],
  proceed: true,
  confidence_score: 0.94,
  damage_detected: false,
  damage_summary: null,
  sku_match: true,
};

// ────────────────────────────────────────────────
// CONDITION — E2 Result
// ────────────────────────────────────────────────

export const mockConditionResult: ConditionResponse = {
  tier: "Good",
  score: 75,
  evidence: [
    { source: "front_image", claim: "Minor signs of use visible on non-stick surface." },
    { source: "bottom_image", claim: "Light scratching on base consistent with normal use." },
    { source: "handle_image", claim: "Handle grip intact, no visible damage." },
    { source: "label_image", claim: "Original branding and model number clearly readable." },
  ],
  suggested_price: 89.95,
  report_text:
    "This All-Clad D3 10-inch Skillet is in Good condition. Minor signs of use are visible on the cooking surface, including light scratching consistent with regular kitchen use. The handle and structural integrity remain excellent. The product is fully functional and suitable for resale at a competitive pre-owned price.",
  eligible_for_resale: true,
  ws_approved: true,
};

// ────────────────────────────────────────────────
// ROUTING — E3 Result
// ────────────────────────────────────────────────

export const mockRoutingResult: RoutingResponse = {
  action: "donate",
  partner: "Habitat for Humanity",
  reason:
    "Good tier cookware with minor cosmetic wear — ideal for donation to support affordable housing programs.",
  impact: {
    co2_avoided_kg: 2.5,
    landfill_diverted_kg: 1.2,
  },
};

// ────────────────────────────────────────────────
// REWARDS
// ────────────────────────────────────────────────

export const mockRewardsData: RewardsData = {
  pointBalance: 2450,
  currentTier: "Sustainability Pioneer",
  nextTier: "Heritage Guardian",
  tierProgress: 0.72,
  totalItemsRescued: 8,
  totalCo2Saved: 45.8,
  rewards: [
    {
      id: "rwd-001",
      title: "$25 Williams-Sonoma Gift Card",
      description: "Redeemable across all Williams-Sonoma stores and online.",
      pointsCost: 1500,
      category: "voucher",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      partner: "Williams-Sonoma",
    },
    {
      id: "rwd-002",
      title: "Professional Knife Sharpening",
      description: "White-glove knife sharpening service at your nearest WS store.",
      pointsCost: 800,
      category: "service",
      image: "https://images.unsplash.com/photo-1566454419290-57a64afe21bd?w=400&h=300&fit=crop",
      partner: "Williams-Sonoma",
    },
    {
      id: "rwd-003",
      title: "$50 Pottery Barn Credit",
      description: "Credit towards any Pottery Barn furniture or home décor.",
      pointsCost: 3000,
      category: "voucher",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
      partner: "Pottery Barn",
    },
    {
      id: "rwd-004",
      title: "Virtual Cooking Masterclass",
      description: "1-hour private session with a Williams-Sonoma culinary expert.",
      pointsCost: 2000,
      category: "experience",
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop",
      partner: "Williams-Sonoma",
    },
  ],
};

// ────────────────────────────────────────────────
// CONFIRMATION
// ────────────────────────────────────────────────

export const mockConfirmation: ConfirmationData = {
  actionType: "donate",
  productName: "All-Clad D3 10in Skillet",
  scheduledDate: "April 15, 2026",
  timeWindow: "9:00 AM – 12:00 PM",
  partnerName: "Habitat for Humanity",
  partnerLocation: "ReStore — Downtown Arts District",
  impactCo2: 2.5,
  impactPoints: 150,
  trackingSteps: [
    { label: "Pickup Scheduled", status: "completed", date: "Apr 10" },
    { label: "Item Collected", status: "active", date: "Apr 15" },
    { label: "Quality Check", status: "upcoming" },
    { label: "Artisan Studio", status: "upcoming" },
  ],
};

// ────────────────────────────────────────────────
// MARKETPLACE — Verified Pre-Owned Products
// ────────────────────────────────────────────────

export const mockMarketplaceProducts: MarketplaceProduct[] = [
  {
    id: "mkt-001",
    name: "Le Creuset Dutch Oven 5.5qt",
    brand: "Le Creuset",
    category: "cookware",
    image: "https://m.media-amazon.com/images/I/718H8+7nilL.jpg",
    price: 189.95,
    originalPrice: 420.00,
    conditionTier: "Excellent",
    conditionScore: 88,
    authenticityScore: 97,
    ownerCount: 1,
    co2SavedKg: 3.2,
    reportText: "Minor signs of regular use. Enamel coating fully intact with no chips or cracks. Lid seal and structural components are pristine. A well-maintained piece ready for many more years of use.",
  },
  {
    id: "mkt-002",
    name: "All-Clad D5 Sauté Pan 3qt",
    brand: "All-Clad",
    category: "cookware",
    image: "https://cutleryandmore.com/cdn/shop/products/39596_4e26233f-564a-4684-8153-2924c3e45cb0_900x.jpg?v=1659107113",
    price: 89.95,
    originalPrice: 225.00,
    conditionTier: "Good",
    conditionScore: 74,
    authenticityScore: 95,
    ownerCount: 2,
    co2SavedKg: 2.1,
    reportText: "Light surface scratching consistent with regular cooking. Stainless steel body shows minor discoloration on base from heat exposure. Handle is firm with no wobble. Fully functional and food-safe.",
  },
  {
    id: "mkt-003",
    name: "Staub Cocotte Round 4qt",
    brand: "Staub",
    category: "cookware",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_l5NP5EEoY__Mk6851O4dfBM8QsKQWFD7AA&s",
    price: 229.00,
    originalPrice: 500.00,
    conditionTier: "Near Mint",
    conditionScore: 95,
    authenticityScore: 99,
    ownerCount: 1,
    co2SavedKg: 4.1,
    reportText: "Near-flawless condition. No visible wear on the matte black enamel interior or exterior. Original knob intact. Used fewer than 10 times — effectively new.",
  },
  {
    id: "mkt-004",
    name: "West Elm Mid-Century Dining Chair",
    brand: "West Elm",
    category: "furniture",
    image: "https://www.westelm.com.au/site/WE/Product%20Images/mid-century-upholstered-dining-chair-velvet-h2338-alt-1-z.jpg?resizeid=53&resizeh=450&resizew=450",
    price: 149.00,
    originalPrice: 349.00,
    conditionTier: "Good",
    conditionScore: 71,
    authenticityScore: 92,
    ownerCount: 1,
    co2SavedKg: 5.8,
    reportText: "Upholstery shows light fading on the seat cushion. Wood legs are structurally sound with minor scuffs. No tears or stains. A solid piece with good remaining life.",
  },
  {
    id: "mkt-005",
    name: "Vitamix A3500 Ascent Blender",
    brand: "Vitamix",
    category: "appliances",
    image: "https://images-cdn.ubuy.co.in/693fa22c33a9a7bfa0064530-vitamix-a3500-ascent-series-smart.jpg",
    price: 299.00,
    originalPrice: 649.95,
    conditionTier: "Excellent",
    conditionScore: 85,
    authenticityScore: 96,
    ownerCount: 1,
    co2SavedKg: 6.3,
    reportText: "Container and blade assembly are clean and scratch-free. Motor base shows only minor cosmetic marks from counter use. All 5 speed settings and pulse function work perfectly.",
  },
];
