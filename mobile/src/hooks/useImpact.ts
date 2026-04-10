/**
 * React Query hooks — Impact & Community
 */

import { useQuery } from "@tanstack/react-query";
import {
  getUserImpact,
  getPortfolio,
  getCommunityStats,
  getCommunityRehomes,
} from "../api/services/impactService";

export function useUserImpact() {
  return useQuery({
    queryKey: ["userImpact"],
    queryFn: getUserImpact,
  });
}

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: getPortfolio,
  });
}

export function useCommunityStats() {
  return useQuery({
    queryKey: ["communityStats"],
    queryFn: getCommunityStats,
  });
}

export function useCommunityRehomes() {
  return useQuery({
    queryKey: ["communityRehomes"],
    queryFn: getCommunityRehomes,
  });
}
