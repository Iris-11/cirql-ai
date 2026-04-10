import { ProductImage, ProductPassport, ConditionResponse, EvidenceItem } from '../types';

export const IMPACT_METRICS = {
  totalCo2SavedKg: 2500450,
  dailyOffsetKg: 14.2,
  wasteReductionPct: 85,
  totalToolsSaved: 120500,
  activeCurators: 45800,
};

export const RECENT_REHOMES = [
  {
    id: "rh1",
    name: "Le Creuset Skillet, 10\"",
    rehomedBy: "Eleanor W.",
    image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=400&auto=format&fit=crop",
    condition: "Mint",
    rating: 5,
  },
  {
    id: "rh2",
    name: "Staub Round Cocotte",
    rehomedBy: "Julian M.",
    image: "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=400&auto=format&fit=crop",
    condition: "Excellent",
    rating: 4.8,
  },
  {
    id: "rh3",
    name: "All-Clad D5 Sauté Pan",
    rehomedBy: "Sarah P.",
    image: "https://images.unsplash.com/photo-1594833211513-e4905307779d?q=80&w=400&auto=format&fit=crop",
    condition: "Good",
    rating: 4.5,
  }
];

export const MOCK_USER_PORTFOLIO = [
  {
    id: "p1",
    brand: "Le Creuset",
    name: "Signature Dutch Oven, 5.5-Qt.",
    status: "Tracked",
    sustainabilityScore: 92,
    image: "https://images.unsplash.com/photo-1590794121404-e59f491f24f5?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "p2",
    brand: "West Elm",
    name: "Mid-Century Show Wood Chair",
    status: "Listed",
    sustainabilityScore: 78,
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=400&auto=format&fit=crop",
  }
];

export const MOCK_REWARDS = [
  {
    id: "r1",
    title: "$50 Williams-Sonoma Gift Card",
    points: 1500,
    image: "https://images.unsplash.com/photo-1549462980-6a013f2bc47a?q=80&w=400&auto=format&fit=crop",
    category: "Voucher",
  },
  {
    id: "r2",
    title: "Professional Knife Sharpening",
    points: 800,
    image: "https://images.unsplash.com/photo-1506484381205-f7945653044d?q=80&w=400&auto=format&fit=crop",
    category: "Service",
  }
];

export const SAMPLE_CONDITION_REPORT: ConditionResponse = {
  tier: "Good",
  score: 75,
  evidence: [
    { claim: "Minor surface scratches", source: "detail_photo_1" },
    { claim: "No structural damage detected", source: "front_angle" }
  ],
  suggested_price: 185.0,
  report_text: "The product is in good functional condition. Aesthetic wear is limited to minor surface marks that do not affect culinary performance.",
  eligible_for_resale: true,
  ws_approved: true,
};
