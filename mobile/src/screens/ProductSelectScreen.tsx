/**
 * ProductSelectScreen — Shows user's owned products (from passports + skus)
 * and lets them pick one before starting verification.
 */

// @ts-ignore — React 19.1 + TS 5.9 IDE false-positive
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft, ChevronRight, ShieldCheck } from "lucide-react-native";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient";
import type { RootStackParamList, SelectedProduct } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface UserPassport {
  passport_id: string;
  sku_code: string;
  name: string;
  brand: string;
  category: string;
  weight_kg: number | null;
  materials: string[] | null;
  retail_price_usd: number | null;
  manufacture_date: string | null;
  reference_images: Record<string, string> | null;
  required_angles: string[] | null;
  condition_tier: string | null;
  sustainability_score: string | null;
  ownership_count: number;
  passport_status: string;
}

function tierColor(tier: string | null): string {
  switch (tier) {
    case "Excellent": return "#1F6F54";
    case "Good":      return "#C49B5F";
    case "Fair":      return "#E07A3A";
    default:          return "#717973";
  }
}

export function ProductSelectScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [passports, setPassports] = useState<UserPassport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    apiClient
      .get<UserPassport[]>(`/user/${user.id}/passports`)
      .then((res) => setPassports(res.data))
      .catch(() => Alert.alert("Error", "Could not load your products. Please try again."))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const handleSelect = (p: UserPassport) => {
    const product: SelectedProduct = {
      passport_id: p.passport_id,
      sku_code: p.sku_code,
      name: p.name,
      brand: p.brand,
      category: p.category,
      weight_kg: p.weight_kg,
      materials: p.materials,
      retail_price_usd: p.retail_price_usd,
      manufacture_date: p.manufacture_date,
      reference_images: p.reference_images,
      required_angles: p.required_angles,
      condition_tier: p.condition_tier,
    };
    navigation.navigate("VerifyProduct", { product });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-3 gap-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#191c1d" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-on-surface">My Products</Text>
          <Text className="text-xs text-outline">Select a product to verify</Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1F6F54" />
          <Text className="text-sm text-outline mt-3">Loading your products...</Text>
        </View>
      ) : passports.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <ShieldCheck size={48} color="#c1c8c2" />
          <Text className="text-lg font-bold text-on-surface mt-4 text-center">
            No Products Found
          </Text>
          <Text className="text-sm text-outline mt-2 text-center">
            Your registered Williams-Sonoma products will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-xs text-outline uppercase tracking-widest font-semibold mb-4">
            {passports.length} product{passports.length !== 1 ? "s" : ""} registered
          </Text>

          {passports.map((p) => {
            const frontImage = p.reference_images?.front ?? p.reference_images?.top;
            const ageMonths = p.manufacture_date
              ? Math.floor(
                  (Date.now() - new Date(p.manufacture_date).getTime()) /
                    (1000 * 60 * 60 * 24 * 30)
                )
              : null;

            return (
              <TouchableOpacity
                key={p.passport_id}
                onPress={() => handleSelect(p)}
                activeOpacity={0.8}
                className="mb-4"
              >
                <Card variant="elevated" className="p-0 overflow-hidden">
                  <View className="flex-row">
                    {/* Product image */}
                    <View
                      style={{ width: 100, height: 100, backgroundColor: "#f3f4f5" }}
                      className="items-center justify-center"
                    >
                      {frontImage ? (
                        <Image
                          source={{ uri: frontImage }}
                          style={{ width: 100, height: 100 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text className="text-xs text-outline text-center px-2">
                          No image
                        </Text>
                      )}
                    </View>

                    {/* Product info */}
                    <View className="flex-1 p-4 justify-between">
                      <View>
                        <Text className="text-xs font-semibold text-outline uppercase tracking-widest">
                          {p.brand}
                        </Text>
                        <Text
                          className="text-sm font-bold text-on-surface mt-0.5"
                          numberOfLines={2}
                        >
                          {p.name}
                        </Text>
                        <Text className="text-xs text-outline mt-0.5">
                          {p.sku_code} · {p.category}
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between mt-3">
                        <View className="flex-row gap-2 flex-wrap">
                          {p.condition_tier && (
                            <Badge
                              label={p.condition_tier}
                              variant="tier"
                            />
                          )}
                          {ageMonths !== null && (
                            <Text className="text-xs text-outline self-center">
                              {ageMonths}mo old
                            </Text>
                          )}
                        </View>
                        <ChevronRight size={18} color="#1F6F54" />
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
