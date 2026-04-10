/**
 * BuyerOrderConfirmScreen — Order placed confirmation for the buyer.
 * Shows order summary, estimated delivery, and impact earned.
 */

import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { CheckCircle, Package, TreePine, Star, Truck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import type { RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "BuyerOrderConfirm">;

const DELIVERY_STEPS = [
  { label: "Order Confirmed", sub: "Today", done: true },
  { label: "Seller Notified", sub: "Within 24 hrs", done: true },
  { label: "Pickup Scheduled", sub: "Within 3 days", done: false },
  { label: "Delivered to You", sub: "Estimated 5–7 days", done: false },
];

export function BuyerOrderConfirmScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { product } = route.params;

  const pointsEarned = Math.round(product.price * 0.5);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="px-6 mt-8 items-center">
          <View className="bg-secondary-fixed rounded-full p-5 mb-4">
            <CheckCircle size={44} color="#1F6F54" />
          </View>
          <Text className="text-2xl font-bold text-on-surface text-center">
            Order Placed!
          </Text>
          <Text className="text-sm text-outline text-center mt-2 px-4 leading-5">
            Your purchase is confirmed. The seller will be notified to prepare your item.
          </Text>
        </View>

        {/* Order Summary */}
        <View className="px-6 mt-6">
          <Card variant="elevated" className="p-0 overflow-hidden">
            <LinearGradient
              colors={["#1F6F54", "#1b4332"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-5 py-5"
            >
              <Text className="text-xs text-white/60 font-medium uppercase tracking-widest">
                {product.brand}
              </Text>
              <Text className="text-lg font-bold text-white mt-1" numberOfLines={1}>
                {product.name}
              </Text>
              <View className="flex-row items-center justify-between mt-3">
                <Badge label={product.conditionTier} variant="verified" />
                <Text className="text-2xl font-bold text-white">
                  ${product.price.toFixed(2)}
                </Text>
              </View>
            </LinearGradient>
          </Card>
        </View>

        {/* Impact + Points */}
        <View className="px-6 mt-4 flex-row gap-3">
          <Card variant="cream" className="flex-1 items-center py-4">
            <View className="bg-secondary-fixed rounded-full p-2 mb-2">
              <TreePine size={16} color="#1F6F54" />
            </View>
            <Text className="text-base font-bold text-on-surface">
              {product.co2SavedKg} kg
            </Text>
            <Text className="text-xs text-outline mt-0.5 text-center">CO₂ Saved</Text>
          </Card>
          <Card variant="cream" className="flex-1 items-center py-4">
            <View className="bg-secondary-fixed rounded-full p-2 mb-2">
              <Star size={16} color="#1F6F54" />
            </View>
            <Text className="text-base font-bold text-on-surface">
              +{pointsEarned}
            </Text>
            <Text className="text-xs text-outline mt-0.5 text-center">Points Earned</Text>
          </Card>
        </View>

        {/* Delivery Timeline */}
        <View className="px-6 mt-5">
          <Text className="text-base font-bold text-on-surface mb-3">
            Delivery Timeline
          </Text>
          <Card variant="flat">
            {DELIVERY_STEPS.map((step, i) => (
              <View key={step.label}>
                <View className="flex-row items-center gap-3 py-2.5">
                  <View
                    className={`rounded-full p-1.5 ${
                      step.done ? "bg-secondary-fixed" : "bg-surface-container-high"
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle size={14} color="#1F6F54" />
                    ) : (
                      <Truck size={14} color="#717973" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-semibold ${
                        step.done ? "text-primary" : "text-on-surface"
                      }`}
                    >
                      {step.label}
                    </Text>
                    <Text className="text-xs text-outline mt-0.5">{step.sub}</Text>
                  </View>
                </View>
                {i < DELIVERY_STEPS.length - 1 && (
                  <View className="ml-5 w-0.5 h-3 bg-surface-container-high" />
                )}
              </View>
            ))}
          </Card>
        </View>

        {/* What's included */}
        <View className="px-6 mt-4">
          <Card variant="flat" className="flex-row items-start gap-3">
            <Package size={16} color="#1F6F54" />
            <Text className="flex-1 text-xs text-outline leading-4">
              Your item includes a digital provenance certificate, AI condition
              report, and CIRQL sustainability badge — delivered with it.
            </Text>
          </Card>
        </View>

        {/* CTA */}
        <View className="px-6 mt-6">
          <Button
            title="Back to Home"
            onPress={() => navigation.popToTop()}
            size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
