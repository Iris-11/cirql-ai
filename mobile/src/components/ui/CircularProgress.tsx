/**
 * CircularProgress — Impact gauge / condition score display
 */

import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CircularProgressProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function CircularProgress({
  value,
  size = 140,
  strokeWidth = 10,
  color = "#1F6F54",
  trackColor = "#e7e8e9",
  label,
  sublabel,
  className = "",
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <View className={`items-center justify-center ${className}`}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View
          className="absolute items-center justify-center"
          style={{ width: size, height: size }}
        >
          <Text className="text-3xl font-bold text-on-surface">{value}</Text>
          {label && (
            <Text className="text-xs text-outline mt-0.5">{label}</Text>
          )}
        </View>
      </View>
      {sublabel && (
        <Text className="text-sm text-outline mt-2 font-medium">
          {sublabel}
        </Text>
      )}
    </View>
  );
}
