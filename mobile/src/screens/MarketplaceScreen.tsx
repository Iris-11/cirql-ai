/**
 * MarketplaceScreen — Browse verified pre-owned products.
 * Hardcoded product catalog with condition badges and provenance info.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ShieldCheck, TreePine, SlidersHorizontal } from "lucide-react-native";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { mockMarketplaceProducts } from "../api/mockData";
import type { RootStackParamList, MarketplaceProduct } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ALL_CATEGORIES = ["All", "cookware", "furniture", "appliances"];

function conditionVariant(tier: string): "tier" | "verified" | "warning" {
  const t = tier.toLowerCase();
  if (t === "near mint" || t === "excellent") return "tier";
  if (t === "good") return "verified";
  return "warning";
}

export function MarketplaceScreen() {
  const navigation = useNavigation<Nav>();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? mockMarketplaceProducts
      : mockMarketplaceProducts.filter((p) => p.category === activeCategory);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-3">
          <View>
            <Text className="text-2xl font-bold text-on-surface">Marketplace</Text>
            <Text className="text-xs text-outline mt-0.5">
              AI-verified · Heritage quality
            </Text>
          </View>
          <View className="bg-surface-container-low rounded-full p-2.5">
            <SlidersHorizontal size={18} color="#1F6F54" />
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 4 }}
        >
          {ALL_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full ${
                activeCategory === cat
                  ? "bg-primary"
                  : "bg-surface-container-low"
              }`}
            >
              <Text
                className={`text-xs font-semibold capitalize ${
                  activeCategory === cat ? "text-white" : "text-on-surface"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Product Grid */}
        <View className="px-6 mt-4 gap-4">
          {filtered.map((product) => (
            <MarketplaceCard
              key={product.id}
              product={product}
              onPress={() =>
                navigation.navigate("MarketplaceProductDetail", { product })
              }
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Marketplace Card ───────────────────────────

function MarketplaceCard({
  product,
  onPress,
}: {
  product: MarketplaceProduct;
  onPress: () => void;
}) {
  const savings = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card variant="elevated" className="p-0 overflow-hidden">
        <Image
          source={{ uri: product.image }}
          className="w-full h-48"
          resizeMode="cover"
        />
        {/* Savings pill */}
        <View className="absolute top-3 left-3 bg-primary px-2.5 py-1 rounded-full">
          <Text className="text-xs font-bold text-white">{savings}% off retail</Text>
        </View>

        <View className="p-4 gap-2">
          {/* Brand + Condition */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-outline uppercase tracking-widest">
              {product.brand}
            </Text>
            <Badge
              label={product.conditionTier}
              variant={conditionVariant(product.conditionTier)}
            />
          </View>

          {/* Name */}
          <Text className="text-base font-bold text-on-surface leading-5">
            {product.name}
          </Text>

          {/* Price row */}
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </Text>
            <Text className="text-sm text-outline line-through">
              ${product.originalPrice.toFixed(2)}
            </Text>
          </View>

          {/* Provenance + CO2 */}
          <View className="flex-row items-center gap-3 mt-1">
            <View className="flex-row items-center gap-1">
              <ShieldCheck size={12} color="#1F6F54" />
              <Text className="text-xs text-primary font-medium">
                AI Verified
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <TreePine size={12} color="#717973" />
              <Text className="text-xs text-outline">
                Saves {product.co2SavedKg} kg CO₂
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
