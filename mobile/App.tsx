/**
 * CIRQL — AI-Powered Product Lifecycle Intelligence
 *
 * Root application entry point.
 */

import "./global.css";

import React from "react";
import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppNavigator } from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { AssessmentProvider } from "./src/context/AssessmentContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <AssessmentProvider>
            <QueryClientProvider client={queryClient}>
              <StatusBar style="dark" />
              <AppNavigator />
            </QueryClientProvider>
          </AssessmentProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
