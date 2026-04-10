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
import { TreePine, Package, ShoppingBag, Trash2 } from "lucide-react-native";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { CircularProgress } from "../components/ui/CircularProgress";
import { ProductCard } from "../components/product/ProductCard";
import { useUserImpact, usePurchaseHistory } from "../hooks/useImpact";
import type { RootStackParamList, PurchaseHistoryItem, PortfolioProduct } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Map a history item to the shape ProductCard expects */
function toPortfolioProduct(item: PurchaseHistoryItem): PortfolioProduct {
  return {
    id: item.passport_id,
    name: item.product_name,
    brand: item.brand || item.sku_code,
    category: item.category,
    image: item.image_url ?? "",
    sustainabilityScore: item.sustainability_score,
    status: "tracked",
    addedDate: item.purchase_date,
  };
}

export function ImpactDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { data: impact, isLoading: impactLoading, refetch } = useUserImpact();
  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = usePurchaseHistory();

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchHistory()]);
    setRefreshing(false);
  };

  if (impactLoading || historyLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#1F6F54" />
      </SafeAreaView>
    );
  }

  const portfolio = (history ?? []).map(toPortfolioProduct);

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

        {/* CO2 + Landfill Cards */}
        <View className="px-6 mt-4 flex-row gap-3">
          <Card variant="cream" className="flex-1">
            <View className="bg-secondary-fixed rounded-2xl p-3 self-start mb-3">
              <TreePine size={20} color="#1F6F54" />
            </View>
            <Text className="text-xl font-bold text-on-surface">
              {impact?.co2SavedKg ?? 0} kg
            </Text>
            <Text className="text-xs text-outline mt-0.5 font-medium">
              CO₂ Avoided
            </Text>
            <Text className="text-xs text-primary font-semibold mt-1">
              ≈ {impact?.treesEquivalent ?? 0} trees
            </Text>
          </Card>

          <Card variant="cream" className="flex-1">
            <View className="bg-secondary-fixed rounded-2xl p-3 self-start mb-3">
              <Trash2 size={20} color="#1F6F54" />
            </View>
            <Text className="text-xl font-bold text-on-surface">
              {impact?.landfillAvoidedKg ?? 0} kg
            </Text>
            <Text className="text-xs text-outline mt-0.5 font-medium">
              Landfill Avoided
            </Text>
          </Card>
        </View>

        {/* Metrics Grid */}
        <View className="px-6 mt-4 flex-row gap-3">
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
        </View>

        {/* Product Portfolio — from history API */}
        <View className="mt-8">
          <View className="px-6 mb-4">
            <Text className="text-xl font-bold text-on-surface">
              Product Portfolio
            </Text>
            {portfolio.length === 0 && (
              <Text className="text-sm text-outline mt-1">
                No products tracked yet.
              </Text>
            )}
          </View>
          <View className="px-6">
            {portfolio.map((product) => (
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
    >
      <View className="bg-surface-container-low rounded-full p-2 mb-2">
        {icon}
      </View>
      <Text className="text-xl font-bold text-on-surface">{value}</Text>
      <Text className="text-xs text-outline mt-0.5 font-medium text-center">{label}</Text>
    </Card>
  );
}
