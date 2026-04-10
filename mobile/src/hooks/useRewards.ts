/**
 * React Query hooks — Rewards
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRewardsData, redeemReward } from "../api/services/rewardsService";

export function useRewardsData() {
  return useQuery({
    queryKey: ["rewards"],
    queryFn: getRewardsData,
  });
}

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rewardId: string) => redeemReward(rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
  });
}
