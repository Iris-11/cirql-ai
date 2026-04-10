/**
 * ProductCard — Editorial-style product display
 *
 * Full-bleed photography, sustainability score, status badge.
 */

import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import type { PortfolioProduct } from "../../types";

interface ProductCardProps {
  product: PortfolioProduct;
  onPress?: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

const statusColors: Record<string, "verified" | "status" | "tier" | "warning" | "points"> = {
  tracked: "status",
  listed: "verified",
  resold: "tier",
  recycled: "verified",
  donated: "verified",
};

export function ProductCard({
  product,
  onPress,
  onAction,
  actionLabel = "Rehome Product",
}: ProductCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card variant="elevated" className="mb-4 p-0 overflow-hidden">
        {/* Product Image — Full bleed */}
        <View className="bg-surface-container-low">
          <Image
            source={{ uri: product.image }}
            className="w-full h-48"
            resizeMode="cover"
          />
        </View>

        {/* Content */}
        <View className="p-5 pt-4 gap-3">
          {/* Brand + Status Row */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-outline uppercase tracking-widest">
              {product.brand}
            </Text>
            <Badge
              label={product.status.charAt(0).toUpperCase() + product.status.slice(1)}
              variant={statusColors[product.status] ?? "status"}
            />
          </View>

          {/* Product Name */}
          <Text className="text-lg font-bold text-on-surface leading-6">
            {product.name}
          </Text>

          {/* Sustainability Score */}
          <View className="flex-row items-center gap-2">
            <View className="bg-secondary-fixed rounded-full px-2.5 py-1 flex-row items-center gap-1">
              <Text className="text-sm">🌿</Text>
              <Text className="text-sm font-bold text-primary-dark">
                {product.sustainabilityScore}
              </Text>
            </View>
            <Text className="text-xs text-outline">Sustainability Score</Text>
          </View>

          {/* Action Button */}
          {onAction && product.status === "tracked" && (
            <Button
              title={actionLabel}
              onPress={onAction}
              variant="primary"
              size="sm"
              className="mt-1"
            />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
