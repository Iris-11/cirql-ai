/**
 * ImageGrid — 4-slot image uploader for verification flow
 */

import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Camera, Plus, Check } from "lucide-react-native";

interface ImageSlot {
  angle: string;
  label: string;
  uri: string | null;
}

interface ImageGridProps {
  slots: ImageSlot[];
  onSlotPress: (index: number) => void;
}

export function ImageGrid({ slots, onSlotPress }: ImageGridProps) {
  const uploadedCount = slots.filter((s) => s.uri).length;

  return (
    <View className="gap-3">
      {/* Progress Header */}
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-sm font-semibold text-on-surface">
          Product Photos
        </Text>
        <Text className="text-sm font-medium text-primary">
          {uploadedCount} / {slots.length} uploaded
        </Text>
      </View>

      {/* Grid */}
      <View className="flex-row flex-wrap gap-3">
        {slots.map((slot, index) => (
          <TouchableOpacity
            key={slot.angle}
            onPress={() => onSlotPress(index)}
            activeOpacity={0.8}
            className="flex-1"
            style={{ minWidth: "46%" }}
          >
            <View
              className={`aspect-square rounded-2xl overflow-hidden items-center justify-center ${
                slot.uri
                  ? "bg-surface-container-low"
                  : "bg-surface-container-low"
              }`}
              style={
                !slot.uri
                  ? {
                      borderWidth: 1.5,
                      borderColor: "rgba(193, 200, 194, 0.3)",
                      borderStyle: "dashed",
                    }
                  : undefined
              }
            >
              {slot.uri ? (
                <View className="w-full h-full">
                  <Image
                    source={{ uri: slot.uri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {/* Success overlay */}
                  <View className="absolute top-2 right-2 bg-primary rounded-full p-1.5">
                    <Check size={14} color="#ffffff" strokeWidth={3} />
                  </View>
                </View>
              ) : (
                <View className="items-center gap-2">
                  <View className="bg-surface-container rounded-full p-3">
                    <Camera size={22} color="#717973" />
                  </View>
                  <Text className="text-xs font-medium text-outline">
                    {slot.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Angle Label beneath */}
            <Text className="text-xs text-center text-outline mt-1.5 font-medium">
              {slot.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Warning if incomplete */}
      {uploadedCount < slots.length && (
        <View className="bg-surface-cream rounded-xl px-4 py-3 flex-row items-center gap-2">
          <Text className="text-sm">⚠️</Text>
          <Text className="text-xs text-on-surface flex-1">
            All {slots.length} angles required for accurate AI verification.
          </Text>
        </View>
      )}
    </View>
  );
}
