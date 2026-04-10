/**
 * Impact & Community Service
 */

import apiClient, { USE_MOCK, simulateDelay } from "../apiClient";
import {
  mockUserImpact,
  mockPortfolio,
  mockCommunityStats,
  mockCommunityRehomes,
} from "../mockData";
import type {
  UserImpact,
  UserProfile,
  PortfolioProduct,
  CommunityStats,
  CommunityRehome,
  PurchaseHistoryItem,
  CategorizedPartners,
} from "../../types";

export async function getUserProfile(email: string): Promise<UserProfile> {
  if (USE_MOCK) {
    await simulateDelay(400);
    return {
      email,
      name: "Demo User",
      city: "San Francisco",
      store_credit_usd: 50,
      reward_points: 1200,
      green_badges: 3,
      is_secondary_buyer: false,
    };
  }
  const { data } = await apiClient.get("/user/profile", { params: { email } });
  return data as UserProfile;
}

export async function getUserImpact(email: string): Promise<UserImpact> {
  if (USE_MOCK) {
    await simulateDelay(600);
    return mockUserImpact;
  }
  const { data } = await apiClient.get("/user/impact", { params: { email } });
  return {
    circularScore: data.circular_impact_score,
    heritageTier: data.heritage_level,
    co2SavedKg: data.co2_avoided_kg,
    treesEquivalent: Math.floor(data.co2_avoided_kg / 21),
    landfillAvoidedKg: data.landfill_avoided_kg,
    trackedItems: data.items_tracked,
    resoldItems: data.items_resold,
  };
}

export async function getPartners(): Promise<CategorizedPartners> {
  const { data } = await apiClient.get("/routing/partners");
  return data as CategorizedPartners;
}

export async function getPurchaseHistory(email: string): Promise<PurchaseHistoryItem[]> {
  if (USE_MOCK) {
    await simulateDelay(500);
    return [];
  }
  const { data } = await apiClient.get("/user/history", { params: { email } });
  return data as PurchaseHistoryItem[];
}

export async function getPortfolio(): Promise<PortfolioProduct[]> {
  if (USE_MOCK) {
    await simulateDelay(500);
    return mockPortfolio;
  }
  return mockPortfolio;
}

export async function getCommunityStats(): Promise<CommunityStats> {
  if (USE_MOCK) {
    await simulateDelay(400);
    return mockCommunityStats;
  }
  const { data } = await apiClient.get("/community/stats");
  return {
    totalCo2SavedKg: data.total_co2_saved_kg,
    totalLandfillDivertedKg: data.total_landfill_diverted_kg,
    totalItemsRehomed: data.total_items_rehomed,
    resalesThisYear: data.resales_this_year,
    totalMembersActive: data.total_members_active,
    totalDonatedRecycled: data.total_donated_recycled,
  };
}

export async function getCommunityRehomes(): Promise<CommunityRehome[]> {
  if (USE_MOCK) {
    await simulateDelay(500);
    return mockCommunityRehomes;
  }
  return mockCommunityRehomes;
}
