/**
 * Badge / Chip — Status tags and AI verification chips
 */

import React from "react";
import { View, Text } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "verified" | "status" | "tier" | "warning" | "points";
  icon?: React.ReactNode;
  className?: string;
}

const variantConfig = {
  verified: {
    bg: "bg-secondary-fixed",
    text: "text-primary-dark",
  },
  status: {
    bg: "bg-surface-container-high",
    text: "text-on-surface",
  },
  tier: {
    bg: "bg-primary",
    text: "text-on-primary",
  },
  warning: {
    bg: "bg-error-container",
    text: "text-error",
  },
  points: {
    bg: "bg-surface-cream",
    text: "text-primary",
  },
};

export function Badge({
  label,
  variant = "status",
  icon,
  className = "",
}: BadgeProps) {
  const config = variantConfig[variant];

  return (
    <View
      className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} ${className}`}
    >
      {icon}
      <Text className={`text-xs font-semibold ${config.text} tracking-wide`}>
        {label}
      </Text>
    </View>
  );
}
