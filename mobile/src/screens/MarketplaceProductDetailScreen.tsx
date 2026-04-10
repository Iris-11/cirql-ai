/**
 * MarketplaceProductDetailScreen — Buyer-facing product page.
 * Shows condition report, provenance, authenticity badge, and Buy Now CTA.
 */

import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import {
  ArrowLeft,
  ShieldCheck,
  TreePine,
  Users,
  Tag,
  Star,
} from "lucide-react-native";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { CircularProgress } from "../components/ui/CircularProgress";
import type { RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "MarketplaceProductDetail">;

function conditionVariant(tier: string): "tier" | "verified" | "warning" {
  const t = tier.toLowerCase();
  if (t === "near mint" || t === "excellent") return "tier";
  if (t === "good") return "verified";
  return "warning";
}

function conditionColor(score: number): string {
  if (score >= 80) return "#1F6F54";
  if (score >= 60) return "#C49B5F";
  return "#ba1a1a";
}

export function MarketplaceProductDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { product } = route.params;

  const savings = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image + Back */}
        <View className="relative">
          <Image
            source={{ uri: product.image }}
            style={{ width: "100%", height: 300 }}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute top-4 left-4 bg-white/90 rounded-full p-2.5"
            style={{ shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 }}
          >
            <ArrowLeft size={20} color="#191c1d" />
          </TouchableOpacity>
          <View className="absolute top-4 right-4 bg-primary px-3 py-1.5 rounded-full">
            <Text className="text-xs font-bold text-white">{savings}% off retail</Text>
          </View>
        </View>

        {/* Brand + Name + Price */}
        <View className="px-6 mt-5">
          <Text className="text-xs font-semibold text-outline uppercase tracking-widest">
            {product.brand}
          </Text>
          <Text className="text-2xl font-bold text-on-surface mt-1 leading-7">
            {product.name}
          </Text>
          <View className="flex-row items-center gap-3 mt-3">
            <Text className="text-3xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </Text>
            <Text className="text-base text-outline line-through">
              ${product.originalPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Badges */}
        <View className="px-6 mt-4 flex-row gap-2 flex-wrap">
          <Badge
            label="AI Verified"
            variant="verified"
            icon={<ShieldCheck size={11} color="#012d1d" />}
          />
          <Badge
            label={product.conditionTier}
            variant={conditionVariant(product.conditionTier)}
          />
          <Badge
            label={`${product.ownerCount} previous owner${product.ownerCount > 1 ? "s" : ""}`}
            variant="status"
            icon={<Users size={11} color="#717973" />}
          />
        </View>

        {/* Condition Score */}
        <View className="px-6 mt-5">
          <Card variant="elevated" className="items-center py-6">
            <CircularProgress
              value={product.conditionScore}
              size={140}
              strokeWidth={11}
              label="/ 100"
              sublabel="Condition Score"
              color={conditionColor(product.conditionScore)}
            />
            <View className="flex-row items-center gap-2 mt-4">
              <Text className="text-xs text-outline">Authenticity</Text>
              <View className="flex-row items-center gap-1">
                <Star size={11} color="#1F6F54" />
                <Text className="text-xs font-bold text-primary">
                  {product.authenticityScore}%
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* AI Condition Report */}
        <View className="px-6 mt-4">
          <Card variant="cream">
            <Text className="text-sm font-bold text-on-surface mb-2">
              AI Condition Report
            </Text>
            <Text className="text-sm text-on-surface leading-5">
              {product.reportText}
            </Text>
          </Card>
        </View>

        {/* Provenance & Impact */}
        <View className="px-6 mt-4 flex-row gap-3">
          <Card variant="flat" className="flex-1 items-center py-4">
            <Tag size={16} color="#1F6F54" />
            <Text className="text-base font-bold text-on-surface mt-2">
              {product.ownerCount}
            </Text>
            <Text className="text-xs text-outline mt-0.5 text-center">
              Previous Owner{product.ownerCount > 1 ? "s" : ""}
            </Text>
          </Card>
          <Card variant="flat" className="flex-1 items-center py-4">
            <TreePine size={16} color="#1F6F54" />
            <Text className="text-base font-bold text-on-surface mt-2">
              {product.co2SavedKg} kg
            </Text>
            <Text className="text-xs text-outline mt-0.5 text-center">
              CO₂ Saved
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Sticky Buy Now */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-surface px-6 pb-8 pt-4"
        style={{ shadowColor: "#191c1d", shadowOpacity: 0.06, shadowRadius: 12, elevation: 6 }}
      >
        <Button
          title={`Buy Now — $${product.price.toFixed(2)}`}
          onPress={() => navigation.navigate("BuyerOrderConfirm", { product })}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}
