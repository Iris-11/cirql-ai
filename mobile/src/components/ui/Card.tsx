/**
 * Card — Product Passport style
 *
 * Design System: No divider lines, xl rounded corners,
 * tonal surface layering for elevation.
 */

import React from "react";
import { View, ViewStyle } from "react-native";

interface CardProps {
  // @ts-ignore — React.ReactNode is a known TS-server false-positive with @types/react 19.1 + TS 5.9
  children?: React.ReactNode;
  variant?: "elevated" | "flat" | "cream";
  className?: string;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = "elevated",
  className = "",
  style,
}: CardProps) {
  const variantStyles: Record<"elevated" | "flat" | "cream", string> = {
    elevated: "bg-white rounded-3xl",
    flat: "bg-surface-container-low rounded-3xl",
    cream: "bg-surface-cream rounded-3xl",
  };

  return (
    <View
      className={`${variantStyles[variant]} p-5 ${className}`}
      style={[
        variant === "elevated"
          ? {
              shadowColor: "#191c1d",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.04,
              shadowRadius: 20,
              elevation: 2,
            }
          : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
}
