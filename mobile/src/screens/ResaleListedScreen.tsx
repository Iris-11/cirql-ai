/**
 * ResaleListedScreen — Shown after seller confirms resale listing.
 * Displays listed price, condition, 3-step seller timeline, and impact preview.
 */

import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { CheckCircle, Tag, Bell, Package, TreePine, Star } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import type { RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "ResaleListed">;

const TIMELINE_STEPS = [
  {
    icon: <Tag size={16} color="#1F6F54" />,
    label: "Listed",
    sub: "Your item is live on the marketplace",
    status: "done",
  },
  {
    icon: <Bell size={16} color="#717973" />,
    label: "Buyer Matched",
    sub: "We'll notify you when a buyer is found",
    status: "upcoming",
  },
  {
    icon: <Package size={16} color="#717973" />,
    label: "Pickup & Payment",
    sub: "Schedule pickup — funds released on delivery",
    status: "upcoming",
  },
];

function tierVariant(tier: string): "tier" | "verified" | "warning" {
  const t = tier.toLowerCase();
  if (t === "near_mint" || t === "excellent") return "tier";
  if (t === "good") return "verified";
  return "warning";
}

export function ResaleListedScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { suggestedPrice, conditionTier } = route.params;

  // Rough point estimate: 1 pt per $1 of listed price
  const estimatedPoints = Math.round(suggestedPrice);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="px-6 mt-6 items-center">
          <View className="bg-secondary-fixed rounded-full p-5 mb-4">
            <CheckCircle size={40} color="#1F6F54" />
          </View>
          <Text className="text-2xl font-bold text-on-surface text-center">
            Your Item is Listed!
          </Text>
          <Text className="text-sm text-outline text-center mt-2 px-4 leading-5">
            Your product is now visible to verified buyers on the CIRQL marketplace.
          </Text>
        </View>

        {/* Price + Condition */}
        <View className="px-6 mt-6">
          <Card variant="elevated" className="p-0 overflow-hidden">
            <LinearGradient
              colors={["#1F6F54", "#1b4332"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-6 py-7 items-center"
            >
              <Text className="text-sm text-white/70 font-medium">Listed Price</Text>
              <Text className="text-5xl font-bold text-white mt-1">
                ${suggestedPrice.toFixed(2)}
              </Text>
              <Badge
                label={conditionTier}
                variant={tierVariant(conditionTier)}
                className="mt-3"
              />
            </LinearGradient>
          </Card>
        </View>

        {/* What Happens Next */}
        <View className="px-6 mt-6">
          <Text className="text-base font-bold text-on-surface mb-3">
            What Happens Next
          </Text>
          <Card variant="flat" className="gap-0">
            {TIMELINE_STEPS.map((step, i) => (
              <View key={step.label}>
                <View className="flex-row items-start gap-3 py-3">
                  <View
                    className={`rounded-full p-2 ${
                      step.status === "done" ? "bg-secondary-fixed" : "bg-surface-container-high"
                    }`}
                  >
                    {step.icon}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-bold ${
                        step.status === "done" ? "text-primary" : "text-on-surface"
                      }`}
                    >
                      {step.label}
                    </Text>
                    <Text className="text-xs text-outline mt-0.5 leading-4">
                      {step.sub}
                    </Text>
                  </View>
                  {step.status === "done" && (
                    <CheckCircle size={16} color="#1F6F54" />
                  )}
                </View>
                {i < TIMELINE_STEPS.length - 1 && (
                  <View className="ml-5 w-0.5 h-4 bg-surface-container-high" />
                )}
              </View>
            ))}
          </Card>
        </View>

        {/* Impact + Rewards Preview */}
        <View className="px-6 mt-4 flex-row gap-3">
          <Card variant="cream" className="flex-1 items-center py-4">
            <View className="bg-secondary-fixed rounded-full p-2 mb-2">
              <TreePine size={16} color="#1F6F54" />
            </View>
            <Text className="text-base font-bold text-on-surface">~2.5 kg</Text>
            <Text className="text-xs text-outline mt-0.5 text-center">CO₂ to be avoided</Text>
          </Card>
          <Card variant="cream" className="flex-1 items-center py-4">
            <View className="bg-secondary-fixed rounded-full p-2 mb-2">
              <Star size={16} color="#1F6F54" />
            </View>
            <Text className="text-base font-bold text-on-surface">+{estimatedPoints}</Text>
            <Text className="text-xs text-outline mt-0.5 text-center">Points on sale</Text>
          </Card>
        </View>

        {/* CTA */}
        <View className="px-6 mt-8">
          <Button
            title="Done"
            onPress={() => navigation.popToTop()}
            size="lg"
          />
          <TouchableOpacity
            className="mt-3 items-center py-3"
            onPress={() => {
              navigation.popToTop();
              // Navigate to marketplace so seller can see their listing
            }}
          >
            <Text className="text-sm text-primary font-semibold">
              Browse the Marketplace
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
