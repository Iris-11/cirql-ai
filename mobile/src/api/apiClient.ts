/**
 * API Client — Axios instance with mock mode toggle.
 *
 * To connect to real backend:
 *   1. Set USE_MOCK = false
 *   2. Update BASE_URL to your FastAPI server address
 */

import axios from "axios";

// ── Configuration ──────────────────────────────
export const USE_MOCK = false;
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ── Axios Instance ─────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — add auth tokens here later
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add Supabase auth token when auth is integrated
    // const token = await getAuthToken();
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — standardize error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Simulates network delay for mock responses.
 */
export const simulateDelay = (ms: number = 800): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default apiClient;
