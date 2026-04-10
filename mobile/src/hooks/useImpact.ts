/**
 * React Query hooks — Impact & Community
 */

import { useQuery } from "@tanstack/react-query";
import {
  getUserProfile,
  getUserImpact,
  getPurchaseHistory,
  getPartners,
  getPortfolio,
  getCommunityStats,
  getCommunityRehomes,
} from "../api/services/impactService";
import { useAuth } from "../context/AuthContext";

export function useUserProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["userProfile", user?.email],
    queryFn: () => getUserProfile(user!.email),
    enabled: !!user?.email,
  });
}

export function useUserImpact() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["userImpact", user?.email],
    queryFn: () => getUserImpact(user!.email),
    enabled: !!user?.email,
  });
}

export function usePurchaseHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["purchaseHistory", user?.email],
    queryFn: () => getPurchaseHistory(user!.email),
    enabled: !!user?.email,
  });
}

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: getPortfolio,
  });
}

export function usePartners() {
  return useQuery({
    queryKey: ["partners"],
    queryFn: getPartners,
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
