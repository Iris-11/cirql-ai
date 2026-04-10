/**
 * ImageGrid — 4-slot image uploader for verification flow
 */

import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Camera, Check } from "lucide-react-native";

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
    <View style={{ gap: 12 }}>
      {/* Progress Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#191c1d" }}>Product Photos</Text>
        <Text style={{ fontSize: 14, fontWeight: "500", color: "#1F6F54" }}>
          {uploadedCount} / {slots.length} uploaded
        </Text>
      </View>

      {/* Grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {slots.map((slot, index) => (
          <TouchableOpacity
            key={slot.angle}
            onPress={() => onSlotPress(index)}
            activeOpacity={0.8}
            style={{ flex: 1, minWidth: "46%" }}
          >
            {/* Image cell */}
            <View style={{ aspectRatio: 1, borderRadius: 16, overflow: "hidden", backgroundColor: "#f3f4f5" }}>
              {slot.uri ? (
                <>
                  <Image
                    source={{ uri: slot.uri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "#1F6F54",
                      borderRadius: 99,
                      padding: 5,
                    }}
                  >
                    <Check size={14} color="#ffffff" strokeWidth={3} />
                  </View>
                </>
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1.5,
                    borderColor: "rgba(193, 200, 194, 0.5)",
                    borderStyle: "dashed",
                    borderRadius: 16,
                    gap: 8,
                  }}
                >
                  <View style={{ backgroundColor: "#e8eae8", borderRadius: 99, padding: 12 }}>
                    <Camera size={22} color="#717973" />
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: "500", color: "#717973" }}>{slot.label}</Text>
                </View>
              )}
            </View>

            {/* Label beneath */}
            <Text style={{ fontSize: 12, textAlign: "center", color: "#717973", marginTop: 6, fontWeight: "500" }}>
              {slot.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Warning if incomplete */}
      {uploadedCount < slots.length && (
        <View style={{ backgroundColor: "#fdf8f0", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 14 }}>⚠️</Text>
          <Text style={{ fontSize: 12, color: "#191c1d", flex: 1 }}>
            All {slots.length} angles required for accurate AI verification.
          </Text>
        </View>
      )}
    </View>
  );
}
