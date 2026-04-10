/**
 * ConfirmationScreen — Emotional payoff & tracking
 */

import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Check, Leaf, MapPin, Calendar, Clock, ArrowRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import type { RootStackParamList, ConfirmationData, TrackingStep } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "Confirmation">;

const ACTION_LABELS: Record<string, string> = {
  resale: "Listing Created",
  donate: "Donation Scheduled",
  recycle: "Recycling Scheduled",
};

export function ConfirmationScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const data: ConfirmationData = route.params.confirmationData;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Hero */}
        <View className="items-center px-6 mt-8">
          <View className="bg-secondary-fixed rounded-full p-5 mb-5">
            <Check size={40} color="#1F6F54" strokeWidth={3} />
          </View>
          <Text className="text-2xl font-bold text-on-surface text-center">
            {ACTION_LABELS[data.actionType] ?? "Action Confirmed"}
          </Text>
          <Text className="text-sm text-outline text-center mt-2">
            {data.productName}
          </Text>
        </View>

        {/* Impact Card */}
        <View className="px-6 mt-6">
          <Card variant="elevated" className="p-0 overflow-hidden">
            <LinearGradient
              colors={["#1F6F54", "#012d1d"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-6"
            >
              <Text className="text-base font-bold text-white mb-4">
                Impact Created
              </Text>
              <View className="flex-row gap-8">
                <View>
                  <Text className="text-2xl font-bold text-white">
                    +{data.impactCo2} kg
                  </Text>
                  <Text className="text-xs text-white/60 mt-1">
                    CO₂ Avoided
                  </Text>
                </View>
                <View>
                  <Text className="text-2xl font-bold text-white">
                    +{data.impactPoints}
                  </Text>
                  <Text className="text-xs text-white/60 mt-1">
                    Points Earned
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Card>
        </View>

        {/* Logistics Summary */}
        <View className="px-6 mt-4">
          <Card variant="cream">
            <Text className="text-sm font-bold text-on-surface mb-3">
              Logistics Details
            </Text>
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <Calendar size={16} color="#717973" />
                <Text className="text-sm text-on-surface">
                  {data.scheduledDate}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Clock size={16} color="#717973" />
                <Text className="text-sm text-on-surface">
                  {data.timeWindow}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <MapPin size={16} color="#717973" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-on-surface">
                    {data.partnerName}
                  </Text>
                  <Text className="text-xs text-outline">
                    {data.partnerLocation}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Journey Timeline */}
        <View className="px-6 mt-6">
          <Text className="text-base font-bold text-on-surface mb-4">
            The Journey
          </Text>
          <Card variant="elevated">
            {data.trackingSteps.map((step: TrackingStep, i: number) => (
              <View key={step.label} className="flex-row items-start gap-3 mb-4">
                {/* Timeline dot */}
                <View className="items-center">
                  <View
                    className={`w-3 h-3 rounded-full ${
                      step.status === "completed"
                        ? "bg-primary"
                        : step.status === "active"
                        ? "bg-secondary-fixed-dim"
                        : "bg-surface-container-high"
                    }`}
                  />
                  {i < data.trackingSteps.length - 1 && (
                    <View
                      className={`w-0.5 h-8 ${
                        step.status === "completed"
                          ? "bg-primary"
                          : "bg-surface-container-high"
                      }`}
                    />
                  )}
                </View>

                <View className="flex-1 -mt-1">
                  <View className="flex-row items-center gap-2">
                    <Text
                      className={`text-sm font-semibold ${
                        step.status !== "upcoming"
                          ? "text-on-surface"
                          : "text-outline"
                      }`}
                    >
                      {step.label}
                    </Text>
                    {step.status === "completed" && (
                      <Check size={12} color="#1F6F54" />
                    )}
                  </View>
                  {step.date && (
                    <Text className="text-xs text-outline mt-0.5">
                      {step.date}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Done Button */}
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
