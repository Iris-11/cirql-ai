/**
 * RecycleScreen — Closing the loop responsibly
 */

import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft, MapPin, Truck, Recycle, Leaf } from "lucide-react-native";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { mockConfirmation } from "../api/mockData";
import type { RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function RecycleScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-3 gap-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#191c1d" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-on-surface">
          Recycle Product
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Impact Card */}
        <Card variant="cream" className="mt-4">
          <View className="flex-row items-center gap-3">
            <View className="bg-secondary-fixed rounded-2xl p-3">
              <Recycle size={24} color="#1F6F54" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-on-surface">
                Recycling this skillet saves
              </Text>
              <Text className="text-2xl font-bold text-primary mt-1">
                1.2 kg of raw material
              </Text>
            </View>
          </View>
        </Card>

        {/* Service Options */}
        <Text className="text-base font-bold text-on-surface mt-8 mb-4">
          Choose a Service
        </Text>

        {/* In-Store Drop-off */}
        <TouchableOpacity activeOpacity={0.9}>
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-start gap-4">
              <View className="bg-surface-container-low rounded-2xl p-3">
                <MapPin size={24} color="#1F6F54" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-on-surface">
                  In-Store Drop-off
                </Text>
                <Text className="text-sm text-outline mt-1 leading-5">
                  Bring your product to the nearest Williams-Sonoma store. Our
                  team will handle the rest.
                </Text>
                <Button
                  title="Find Nearest Store"
                  onPress={() =>
                    navigation.navigate("Confirmation", {
                      confirmationData: {
                        ...mockConfirmation,
                        actionType: "recycle",
                        partnerName: "Williams-Sonoma — Mall of America",
                      },
                    })
                  }
                  variant="primary"
                  size="sm"
                  className="mt-4 self-start"
                />
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Courier Pickup */}
        <TouchableOpacity activeOpacity={0.9}>
          <Card variant="elevated">
            <View className="flex-row items-start gap-4">
              <View className="bg-surface-container-low rounded-2xl p-3">
                <Truck size={24} color="#1F6F54" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-on-surface">
                  Courier Pickup
                </Text>
                <Text className="text-sm text-outline mt-1 leading-5">
                  Schedule a free pickup from your home. Available Monday–Saturday, 9AM–6PM.
                </Text>
                <Button
                  title="Schedule Pickup"
                  onPress={() =>
                    navigation.navigate("Confirmation", {
                      confirmationData: {
                        ...mockConfirmation,
                        actionType: "recycle",
                      },
                    })
                  }
                  variant="primary"
                  size="sm"
                  className="mt-4 self-start"
                />
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Educational Footer */}
        <Card variant="flat" className="mt-8">
          <View className="flex-row items-start gap-3">
            <Leaf size={20} color="#1F6F54" />
            <View className="flex-1">
              <Text className="text-sm font-bold text-on-surface">
                Why We Recycle
              </Text>
              <Text className="text-sm text-outline mt-2 leading-5">
                Cast iron and stainless steel are infinitely recyclable. By
                recycling your cookware, we recover the metal and reduce the
                need for energy-intensive mining, smelting, and casting from
                virgin materials.
              </Text>
              <View className="flex-row flex-wrap gap-2 mt-3">
                <Badge label="Cast Iron Reclamation" variant="verified" />
                <Badge label="Steel Recovery" variant="verified" />
                <Badge label="Zero Landfill" variant="verified" />
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
