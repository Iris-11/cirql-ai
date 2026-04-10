/**
 * App Navigator — Stack + Tab navigation
 */

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import { Home, Gift, User, TrendingUp } from "lucide-react-native";

import { LoginScreen } from "../screens/LoginScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ProductSelectScreen } from "../screens/ProductSelectScreen";
import { HowItWorksScreen } from "../screens/HowItWorksScreen";
import { ImpactDashboardScreen } from "../screens/ImpactDashboardScreen";
import { VerifyProductScreen } from "../screens/VerifyProductScreen";
import { VerificationPendingScreen } from "../screens/VerificationPendingScreen";
import { VerificationResultScreen } from "../screens/VerificationResultScreen";
import { RecycleScreen } from "../screens/RecycleScreen";
import { RewardsCatalogScreen } from "../screens/RewardsCatalogScreen";
import { ConfirmationScreen } from "../screens/ConfirmationScreen";

import type { RootStackParamList, TabParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ── Tab Navigator ──────────────────────────────

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          height: 85,
          paddingBottom: 28,
          paddingTop: 12,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: "absolute",
          shadowColor: "#191c1d",
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.05,
          shadowRadius: 20,
          elevation: 10,
        },
        tabBarActiveTintColor: "#1F6F54",
        tabBarInactiveTintColor: "#717973",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <Home size={22} color={color} />
              {focused && (
                <View className="w-1 h-1 rounded-full bg-primary mt-1" />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Impact"
        component={ImpactDashboardScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <TrendingUp size={22} color={color} />
              {focused && (
                <View className="w-1 h-1 rounded-full bg-primary mt-1" />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Rewards"
        component={RewardsCatalogScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <Gift size={22} color={color} />
              {focused && (
                <View className="w-1 h-1 rounded-full bg-primary mt-1" />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilePlaceholder}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <User size={22} color={color} />
              {focused && (
                <View className="w-1 h-1 rounded-full bg-primary mt-1" />
              )}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function ProfilePlaceholder() {
  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <Text className="text-lg text-outline">Profile — Coming Soon</Text>
    </View>
  );
}

// ── Root Stack Navigator ───────────────────────

export function AppNavigator() {
  const { user, isLoading } = useAuth();

  // Still reading AsyncStorage — show spinner to avoid login flash
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#faf9f6" }}>
        <ActivityIndicator size="large" color="#1F6F54" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#faf9f6" },
          animation: "slide_from_right",
        }}
      >
        {user ? (
          // ── Authenticated ──────────────────────
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="HowItWorks" component={HowItWorksScreen} />
            <Stack.Screen name="ProductSelect" component={ProductSelectScreen} />
            <Stack.Screen name="VerifyProduct" component={VerifyProductScreen} />
            <Stack.Screen name="VerificationPending" component={VerificationPendingScreen} />
            <Stack.Screen name="VerificationResult" component={VerificationResultScreen} />
            <Stack.Screen name="RecycleProduct" component={RecycleScreen} />
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
          </>
        ) : (
          // ── Unauthenticated ────────────────────
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
