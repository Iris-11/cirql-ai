/**
 * ImpactDashboardScreen — Personal ESG dashboard & portfolio
 */

import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TreePine, Package, ShoppingBag, Recycle, Zap } from "lucide-react-native";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { CircularProgress } from "../components/ui/CircularProgress";
import { ProductCard } from "../components/product/ProductCard";
import { useUserImpact, usePortfolio } from "../hooks/useImpact";
import type { RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ImpactDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { data: impact, isLoading: impactLoading, refetch } = useUserImpact();
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio();

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (impactLoading || portfolioLoading) {
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 py-3">
          <Text className="text-2xl font-bold text-on-surface">
            Your Impact
          </Text>
          <Text className="text-sm text-outline mt-1">
            Track your contribution to a circular economy
          </Text>
        </View>

        {/* Circular Score */}
        <View className="px-6 mt-4">
          <Card variant="elevated" className="items-center py-7">
            <CircularProgress
              value={impact?.circularScore ?? 0}
              size={160}
              strokeWidth={12}
              label="/ 100"
              sublabel="Circular Impact Score"
            />
            <Badge
              label={impact?.heritageTier ?? ""}
              variant="tier"
              className="mt-4"
            />
          </Card>
        </View>

        {/* CO2 Card */}
        <View className="px-6 mt-4">
          <Card variant="cream">
            <View className="flex-row items-center gap-3">
              <View className="bg-secondary-fixed rounded-2xl p-3">
                <TreePine size={24} color="#1F6F54" />
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-on-surface">
                  {impact?.co2SavedKg ?? 0} kg CO₂
                </Text>
                <Text className="text-sm text-outline mt-0.5">
                  Equivalent to planting{" "}
                  <Text className="font-bold text-primary">
                    {impact?.treesEquivalent ?? 0} young trees
                  </Text>
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Metrics Grid */}
        <View className="px-6 mt-4 flex-row flex-wrap gap-3">
          <MetricCard
            icon={<Package size={18} color="#1F6F54" />}
            value={impact?.trackedItems ?? 0}
            label="Tracked"
          />
          <MetricCard
            icon={<ShoppingBag size={18} color="#1F6F54" />}
            value={impact?.resoldItems ?? 0}
            label="Resold"
          />
          <MetricCard
            icon={<Recycle size={18} color="#1F6F54" />}
            value={impact?.recycledItems ?? 0}
            label="Recycled"
          />
          <MetricCard
            icon={<Zap size={18} color="#1F6F54" />}
            value={impact?.impactPoints ?? 0}
            label="Points"
          />
        </View>

        {/* Product Portfolio */}
        <View className="mt-8">
          <View className="px-6 mb-4">
            <Text className="text-xl font-bold text-on-surface">
              Product Portfolio
            </Text>
          </View>
          <View className="px-6">
            {(portfolio ?? []).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAction={() =>
                  navigation.navigate("VerifyProduct", {
                    productId: product.id,
                  })
                }
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Metric Card ────────────────────────────────

function MetricCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Card
      variant="elevated"
      className="flex-1 items-center py-4 px-3"
      style={{ minWidth: "45%" }}
    >
      <View className="bg-surface-container-low rounded-full p-2 mb-2">
        {icon}
      </View>
      <Text className="text-xl font-bold text-on-surface">{value}</Text>
      <Text className="text-xs text-outline mt-0.5 font-medium">{label}</Text>
    </Card>
  );
}
