/**
 * Impact & Community Service
 */

import { USE_MOCK, simulateDelay } from "../apiClient";
import {
  mockUserImpact,
  mockPortfolio,
  mockCommunityStats,
  mockCommunityRehomes,
} from "../mockData";
import type {
  UserImpact,
  PortfolioProduct,
  CommunityStats,
  CommunityRehome,
} from "../../types";

export async function getUserImpact(): Promise<UserImpact> {
  if (USE_MOCK) {
    await simulateDelay(600);
    return mockUserImpact;
  }
  // const { data } = await apiClient.get<UserImpact>("/user/impact");
  // return data;
  return mockUserImpact;
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
  return mockCommunityStats;
}

export async function getCommunityRehomes(): Promise<CommunityRehome[]> {
  if (USE_MOCK) {
    await simulateDelay(500);
    return mockCommunityRehomes;
  }
  return mockCommunityRehomes;
}
