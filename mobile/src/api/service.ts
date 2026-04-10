import axios from 'axios';
import { 
  IMPACT_METRICS, 
  RECENT_REHOMES, 
  MOCK_USER_PORTFOLIO, 
  MOCK_REWARDS, 
  SAMPLE_CONDITION_REPORT 
} from './mockData';
import { ConditionRequest, ConditionResponse, ImpactMetrics, RecentRehome } from '../types';

// Standard Axios instance setup
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Target FastAPI backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiService = {
  getImpactMetrics: async (): Promise<ImpactMetrics> => {
    await delay(1200);
    return IMPACT_METRICS;
  },

  getRecentRehomes: async (): Promise<RecentRehome[]> => {
    await delay(800);
    return RECENT_REHOMES;
  },

  getUserPortfolio: async () => {
    await delay(1000);
    return MOCK_USER_PORTFOLIO;
  },

  getRewards: async () => {
    await delay(1500);
    return MOCK_REWARDS;
  },

  submitConditionReport: async (request: ConditionRequest): Promise<ConditionResponse> => {
    console.log('Mock: Submitting condition report for', request.passport.name);
    await delay(2500); // Simulate high-tech AI processing time
    return SAMPLE_CONDITION_REPORT;
  }
};
