/**
 * Rewards Service
 */

import { USE_MOCK, simulateDelay } from "../apiClient";
import { mockRewardsData } from "../mockData";
import type { RewardsData } from "../../types";

export async function getRewardsData(): Promise<RewardsData> {
  if (USE_MOCK) {
    await simulateDelay(600);
    return mockRewardsData;
  }
  return mockRewardsData;
}

export async function redeemReward(rewardId: string): Promise<{ success: boolean; newBalance: number }> {
  if (USE_MOCK) {
    await simulateDelay(1000);
    const reward = mockRewardsData.rewards.find((r) => r.id === rewardId);
    return {
      success: true,
      newBalance: mockRewardsData.pointBalance - (reward?.pointsCost ?? 0),
    };
  }
  return { success: true, newBalance: 0 };
}
