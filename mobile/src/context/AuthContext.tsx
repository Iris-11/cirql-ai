/**
 * AuthContext — Global user session
 *
 * Stores the logged-in user in memory AND AsyncStorage so the session
 * survives app restarts. Any screen can call useAuth() to get:
 *   - user.id        → Google's unique user ID (use this for API calls)
 *   - user.email
 *   - user.name
 *   - user.picture
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Types ──────────────────────────────────────

export interface AuthUser {
  id: string;       // Google "sub" — stable unique ID, use for all API calls
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;        // true while reading AsyncStorage on startup
  signIn: (user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
}

// ── Context ────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "@cirql_user";

// ── Provider ───────────────────────────────────

// @ts-ignore — React.ReactNode false-positive with @types/react 19.1 + TS 5.9
export function AuthProvider({ children }: { children?: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from storage on app launch
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setUser(JSON.parse(raw) as AuthUser);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (newUser: AuthUser) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
