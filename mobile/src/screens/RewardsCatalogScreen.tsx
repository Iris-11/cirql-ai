/**
 * RewardsCatalogScreen — Incentivizing sustainable behavior
 */

import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Award, Star, ChevronRight, Leaf } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useRewardsData, useRedeemReward } from "../hooks/useRewards";
import type { Reward } from "../types";

export function RewardsCatalogScreen() {
  const { data: rewards, isLoading } = useRewardsData();
  const redeemMutation = useRedeemReward();

  if (isLoading || !rewards) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#1F6F54" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 py-3">
          <Text className="text-2xl font-bold text-on-surface">Rewards</Text>
        </View>

        {/* Points Balance */}
        <View className="px-6 mt-2">
          <Card variant="elevated" className="p-0 overflow-hidden">
            <LinearGradient
              colors={["#1F6F54", "#1b4332"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-7"
            >
              <Text className="text-sm text-white/70 font-medium">
                Your Balance
              </Text>
              <View className="flex-row items-baseline gap-2 mt-1">
                <Text className="text-5xl font-bold text-white">
                  {rewards.pointBalance.toLocaleString()}
                </Text>
                <Text className="text-lg text-white/70 font-medium">pts</Text>
              </View>
            </LinearGradient>
          </Card>
        </View>

        {/* Tier Status */}
        <View className="px-6 mt-4">
          <Card variant="cream">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Award size={18} color="#1F6F54" />
                <Text className="text-sm font-bold text-on-surface">
                  {rewards.currentTier}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-xs text-outline">
                  Next: {rewards.nextTier}
                </Text>
                <ChevronRight size={14} color="#717973" />
              </View>
            </View>
            {/* Progress Bar */}
            <View className="mt-3 h-2 bg-surface-container-high rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${rewards.tierProgress * 100}%` }}
              />
            </View>
            <Text className="text-xs text-outline mt-2">
              {Math.round(rewards.tierProgress * 100)}% to{" "}
              {rewards.nextTier}
            </Text>
          </Card>
        </View>

        {/* Curated Rewards */}
        <View className="mt-8">
          <Text className="text-xl font-bold text-on-surface px-6 mb-4">
            Curated Rewards
          </Text>

          <View className="px-6 gap-4">
            {rewards.rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                canAfford={rewards.pointBalance >= reward.pointsCost}
                onRedeem={() => redeemMutation.mutate(reward.id)}
                isRedeeming={redeemMutation.isPending}
              />
            ))}
          </View>
        </View>

        {/* Provenance Commitment */}
        <View className="px-6 mt-8">
          <Card variant="flat">
            <View className="flex-row items-center gap-2 mb-2">
              <Leaf size={16} color="#1F6F54" />
              <Text className="text-sm font-bold text-on-surface">
                Your Provenance Commitment
              </Text>
            </View>
            <View className="flex-row gap-6 mt-2">
              <View>
                <Text className="text-xl font-bold text-primary">
                  {rewards.totalItemsRescued}
                </Text>
                <Text className="text-xs text-outline">Items Rescued</Text>
              </View>
              <View>
                <Text className="text-xl font-bold text-primary">
                  {rewards.totalCo2Saved} kg
                </Text>
                <Text className="text-xs text-outline">CO₂ Saved</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Reward Card ────────────────────────────────

function RewardCard({
  reward,
  canAfford,
  onRedeem,
  isRedeeming,
}: {
  reward: Reward;
  canAfford: boolean;
  onRedeem: () => void;
  isRedeeming: boolean;
}) {
  const categoryIcons: Record<string, React.ReactNode> = {
    voucher: <Star size={12} color="#C49B5F" />,
    service: <Award size={12} color="#1F6F54" />,
    experience: <Star size={12} color="#1F6F54" />,
  };

  return (
    <Card variant="elevated" className="p-0 overflow-hidden">
      <Image
        source={{ uri: reward.image }}
        className="w-full h-32"
        resizeMode="cover"
      />
      <View className="p-4 gap-2">
        <View className="flex-row items-center justify-between">
          <Badge
            label={reward.category.charAt(0).toUpperCase() + reward.category.slice(1)}
            variant="status"
            icon={categoryIcons[reward.category]}
          />
          <Text className="text-sm font-bold text-primary">
            {reward.pointsCost.toLocaleString()} pts
          </Text>
        </View>
        <Text className="text-base font-bold text-on-surface">
          {reward.title}
        </Text>
        <Text className="text-sm text-outline" numberOfLines={2}>
          {reward.description}
        </Text>
        <Button
          title={canAfford ? "Redeem" : "Not Enough Points"}
          onPress={onRedeem}
          variant={canAfford ? "primary" : "secondary"}
          disabled={!canAfford || isRedeeming}
          loading={isRedeeming}
          size="sm"
          className="mt-1"
        />
      </View>
    </Card>
  );
}
