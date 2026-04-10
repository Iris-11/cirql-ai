// ────────────────────────────────────────────────
// Product & Verification Types
// ────────────────────────────────────────────────

// Shape sent to the backend — matches backend models/schemas.py ProductImage
export interface ProductImage {
  photo_id: string;
  url: string;   // public Supabase Storage URL
  label: string; // "front_view" | "back_view" | "top_view" | "bottom_view" etc.
}

export interface ProductPassport {
  sku_code: string;
  brand: string;
  name: string;
  category: string;
  age_in_months?: number;
  original_price?: number;
  materials?: string[];
  weight?: number;
  reference_images?: Record<string, string>;
  known_issues?: string;
}

export interface GradingRubric {
  [key: string]: string;
}

export interface UserLocation {
  zip_code?: string;
  country?: string;
}

export interface ProductSubmission {
  product_id?: string;
  listing_id?: string;
  submission_timestamp: string;
  images: ProductImage[];
  passport: ProductPassport;
  grading_rubric?: GradingRubric;
  user_location?: UserLocation;
}

// ────────────────────────────────────────────────
// E1 — Verification Result
// ────────────────────────────────────────────────

export interface VerificationResult {
  complete: boolean;
  completeness_note?: string;
  authenticity_score: number;
  missing_angles: string[];
  flags: string[];
  proceed: boolean;
  confidence_score: number;
  damage_detected: boolean;
  damage_summary?: string | null;
  sku_match: boolean;
}

// ────────────────────────────────────────────────
// E2 — Condition Report
// ────────────────────────────────────────────────

export interface Evidence {
  source: string;
  claim: string;
}

export interface ConditionResponse {
  tier: string;
  score: number;
  evidence: Evidence[];
  suggested_price: number | null;
  report_text: string;
  eligible_for_resale: boolean;
  ws_approved: boolean;
}

// ────────────────────────────────────────────────
// E3 — Routing
// ────────────────────────────────────────────────

export interface Impact {
  co2_avoided_kg: number;
  landfill_diverted_kg: number;
}

export interface RoutingResponse {
  action: "resale" | "donate" | "recycle";
  partner: string;
  reason: string;
  impact: Impact;
}

// ────────────────────────────────────────────────
// Full Pipeline Result (E1 + E2 + E3)
// ────────────────────────────────────────────────

export interface FullPipelineResult {
  listing_id: string;
  confidence_score: number;
  pending_review: boolean;
  e1_result: VerificationResult;
  e2_result: ConditionResponse;
  e3_result: RoutingResponse | null;
}

// Keep for backward compat
export type FullAssessmentResult = FullPipelineResult;

// ────────────────────────────────────────────────
// Impact Dashboard
// ────────────────────────────────────────────────

export interface UserProfile {
  id?: string;
  name?: string;
  city?: string;
  email: string;
  store_credit_usd: number;
  reward_points: number;
  green_badges: number;
  is_secondary_buyer: boolean;
}

export interface UserImpact {
  circularScore: number;
  heritageTier: string;
  co2SavedKg: number;
  treesEquivalent: number;   // derived: floor(co2SavedKg / 21)
  landfillAvoidedKg: number;
  trackedItems: number;
  resoldItems: number;
}

export interface PurchaseHistoryItem {
  passport_id: string;
  product_name: string;
  sku_code: string;
  category: string;
  brand: string;
  event_type: string;
  purchase_date: string;
  retail_price_usd: number;
  sustainability_score: number;
  image_url?: string;
}

export interface PortfolioProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  sustainabilityScore: number;
  status: "tracked" | "listed" | "resold" | "recycled" | "donated";
  addedDate: string;
}

// ────────────────────────────────────────────────
// Rewards
// ────────────────────────────────────────────────

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: "voucher" | "service" | "experience";
  image: string;
  partner: string;
}

export interface RewardsData {
  pointBalance: number;
  currentTier: string;
  nextTier: string;
  tierProgress: number;
  totalItemsRescued: number;
  totalCo2Saved: number;
  rewards: Reward[];
}

// ────────────────────────────────────────────────
// Community / Home
// ────────────────────────────────────────────────

export interface CommunityRehome {
  id: string;
  productName: string;
  brand: string;
  image: string;
  rating: number;
  provenanceVerified: boolean;
  savedDate: string;
}

export interface CommunityStats {
  totalCo2SavedKg: number;
  totalLandfillDivertedKg: number;
  totalItemsRehomed: number;
  resalesThisYear: number;
  totalMembersActive: number;
  totalDonatedRecycled: number;
}

// ────────────────────────────────────────────────
// Confirmation
// ────────────────────────────────────────────────

export interface ConfirmationData {
  actionType: "resale" | "donate" | "recycle";
  productName: string;
  scheduledDate: string;
  timeWindow: string;
  partnerName: string;
  partnerLocation: string;
  impactCo2: number;
  impactPoints: number;
  trackingSteps: TrackingStep[];
}

export interface TrackingStep {
  label: string;
  status: "completed" | "active" | "upcoming";
  date?: string;
}

// ────────────────────────────────────────────────
// Navigation
// ────────────────────────────────────────────────

export interface SelectedProduct {
  passport_id: string;
  sku_code: string;
  name: string;
  brand: string;
  category: string;
  weight_kg: number | null;
  materials: string[] | null;
  retail_price_usd: number | null;
  manufacture_date: string | null;
  reference_images: Record<string, string> | null;
  required_angles: string[] | null;
  condition_tier: string | null;
}

export interface Partner {
  id: string;
  name: string;
  type: string;
  accepted_categories: string[];
  min_condition_tier?: string | null;
  regions: string[];
  active: boolean;
}

export interface CategorizedPartners {
  donate: Partner[];
  recycle: Partner[];
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  price: number;
  originalPrice: number;
  conditionTier: string;
  conditionScore: number;
  authenticityScore: number;
  ownerCount: number;
  co2SavedKg: number;
  reportText: string;
}

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  HowItWorks: undefined;
  ProductSelect: undefined;
  VerifyProduct: { product: SelectedProduct };
  VerificationPending: { productId: string };
  VerificationResult: { result: FullPipelineResult } | { productId: string };
  ResaleListed: { listingId: string; suggestedPrice: number; conditionTier: string };
  DonateProduct: { listingId: string };
  RecycleProduct: { listingId: string };
  Confirmation: { confirmationData: ConfirmationData };
  Marketplace: undefined;
  MarketplaceProductDetail: { product: MarketplaceProduct };
  BuyerOrderConfirm: { product: MarketplaceProduct };
};

export type TabParamList = {
  Home: undefined;
  Rewards: undefined;
  Impact: undefined;
  Profile: undefined;
};
