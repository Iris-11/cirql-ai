/**
 * Button — Primary / Secondary / Tertiary
 *
 * Design System: Rounded-full, gradient primary fill, no borders.
 */

import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: "py-2.5 px-5",
    md: "py-3.5 px-7",
    lg: "py-4 px-9",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        className={`rounded-full overflow-hidden ${isDisabled ? "opacity-50" : ""} ${className}`}
      >
        <LinearGradient
          colors={["#1F6F54", "#1b4332"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`${sizeStyles[size]} flex-row items-center justify-center`}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <View className="flex-row items-center gap-2">
              {icon}
              <Text
                className={`text-white font-semibold ${textSizes[size]} tracking-wide`}
              >
                {title}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === "secondary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        className={`${sizeStyles[size]} rounded-full bg-surface-container-highest flex-row items-center justify-center ${isDisabled ? "opacity-50" : ""} ${className}`}
      >
        {loading ? (
          <ActivityIndicator color="#191c1d" size="small" />
        ) : (
          <View className="flex-row items-center gap-2">
            {icon}
            <Text
              className={`text-on-surface font-semibold ${textSizes[size]}`}
            >
              {title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Tertiary — text only
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.6}
      className={`py-2 px-1 ${isDisabled ? "opacity-50" : ""} ${className}`}
    >
      <Text className={`text-primary font-medium ${textSizes[size]} underline`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
