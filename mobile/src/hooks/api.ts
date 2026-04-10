import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiService } from '../api/service';
import { ConditionRequest } from '../types';

export const useImpactMetrics = () => {
  return useQuery({
    queryKey: ['impact-metrics'],
    queryFn: mockApiService.getImpactMetrics,
  });
};

export const useRecentRehomes = () => {
  return useQuery({
    queryKey: ['recent-rehomes'],
    queryFn: mockApiService.getRecentRehomes,
  });
};

export const usePortfolio = () => {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: mockApiService.getUserPortfolio,
  });
};

export const useRewards = () => {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: mockApiService.getRewards,
  });
};

export const useGradeCondition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: ConditionRequest) => mockApiService.submitConditionReport(request),
    onSuccess: (data) => {
      // Invalidate portfolio or other related queries if needed
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
};
