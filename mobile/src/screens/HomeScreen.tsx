/**
 * HomeScreen — Community Impact & Discovery
 */

// @ts-ignore — React 19.1 + TS 5.9 false-positive
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Leaf, ShieldCheck, Scan, ShoppingBag } from "lucide-react-native";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useCommunityStats, useCommunityRehomes } from "../hooks/useImpact";
import type { RootStackParamList, CommunityRehome } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { data: stats, refetch } = useCommunityStats();
  const { data: rehomes } = useCommunityRehomes();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ── Top Bar ── */}
        <View className="flex-row items-center justify-between px-6 py-3">
          <Text className="text-2xl font-bold text-primary tracking-wider">
            CIRQL
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("ProductSelect")}
            className="bg-primary rounded-full p-2.5"
          >
            <Scan size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* ── Community Hero ── */}
        <View className="px-6 mt-4">
          <Card variant="elevated" className="p-0 overflow-hidden">
            <LinearGradient
              colors={["#1F6F54", "#012d1d"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-7"
            >
              <Text className="text-base text-white/70 font-medium mb-1">
                Together we've saved
              </Text>
              <Text className="text-4xl font-bold text-white leading-tight">
                {stats ? formatNumber(stats.totalCo2SavedKg) : "..."} kg
              </Text>
              <Text className="text-lg text-white/90 font-semibold mt-0.5">
                of CO₂ emissions
              </Text>

              {/* Live Metrics — Row 1 */}
              <View className="flex-row mt-6 gap-6">
                <View>
                  <Text className="text-2xl font-bold text-white">
                    {stats ? formatNumber(stats.totalItemsRehomed) : "..."}
                  </Text>
                  <Text className="text-xs text-white/60 mt-0.5">
                    Items Rehomed
                  </Text>
                </View>
                <View>
                  <Text className="text-2xl font-bold text-white">
                    {stats ? formatNumber(stats.totalMembersActive) : "..."}
                  </Text>
                  <Text className="text-xs text-white/60 mt-0.5">
                    Active Members
                  </Text>
                </View>
                <View>
                  <Text className="text-2xl font-bold text-white">
                    {stats ? formatNumber(stats.resalesThisYear) : "..."}
                  </Text>
                  <Text className="text-xs text-white/60 mt-0.5">
                    Resales This Year
                  </Text>
                </View>
              </View>

              {/* Live Metrics — Row 2 */}
              <View className="flex-row mt-4 gap-6">
                <View>
                  <Text className="text-2xl font-bold text-white">
                    {stats ? formatNumber(stats.totalLandfillDivertedKg) : "..."} kg
                  </Text>
                  <Text className="text-xs text-white/60 mt-0.5">
                    Landfill Diverted
                  </Text>
                </View>
                <View>
                  <Text className="text-2xl font-bold text-white">
                    {stats ? formatNumber(stats.totalDonatedRecycled) : "..."}
                  </Text>
                  <Text className="text-xs text-white/60 mt-0.5">
                    Donated / Recycled
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Card>
        </View>

        {/* ── How It Works CTA ── */}
        <View className="px-6 mt-5">
          <TouchableOpacity
            onPress={() => navigation.navigate("HowItWorks")}
            activeOpacity={0.8}
          >
            <Card variant="cream" className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-on-surface">
                  Heritage That Lives On
                </Text>
                <Text className="text-sm text-outline mt-1">
                  Learn how CIRQL curates, certifies & circulates
                </Text>
              </View>
              <View className="bg-primary rounded-full p-2">
                <ArrowRight size={18} color="#ffffff" />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* ── Community Rehomes Gallery ── */}
        <View className="mt-8">
          <View className="flex-row items-center justify-between px-6 mb-4">
            <Text className="text-xl font-bold text-on-surface">
              Recently Rehomed
            </Text>
            <Text className="text-sm text-primary font-semibold">
              View All
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          >
            {(rehomes ?? []).map((item: CommunityRehome) => (
              <RehomeCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        {/* ── Verify CTA ── */}
        <View className="px-6 mt-8">
          <Card variant="flat" className="items-center py-8">
            <View className="bg-secondary-fixed rounded-full p-4 mb-4">
              <Leaf size={28} color="#1F6F54" />
            </View>
            <Text className="text-lg font-bold text-on-surface text-center">
              Start Your Circular Journey
            </Text>
            <Text className="text-sm text-outline text-center mt-2 px-4">
              Scan and verify your Williams-Sonoma products to earn rewards and reduce waste.
            </Text>
            <Button
              title="Verify a Product"
              onPress={() => navigation.navigate("ProductSelect")}
              className="mt-5"
            />
          </Card>
        </View>

        {/* ── Marketplace CTA ── */}
        <View className="px-6 mt-5">
          <TouchableOpacity onPress={() => navigation.navigate("Marketplace")} activeOpacity={0.8}>
            <Card variant="elevated" className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-on-surface">
                  Shop Pre-Owned
                </Text>
                <Text className="text-sm text-outline mt-1">
                  Browse AI-verified heritage products from other members.
                </Text>
              </View>
              <View className="bg-primary rounded-full p-2 ml-3">
                <ShoppingBag size={18} color="#ffffff" />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* ── Newsletter ── */}
        <View className="px-6 mt-6">
          <Card variant="elevated">
            <Text className="text-base font-bold text-on-surface">
              Join the Circular Culinary Movement
            </Text>
            <Text className="text-sm text-outline mt-1">
              Get exclusive access to sustainability insights and early rewards.
            </Text>
            <Button
              title="Subscribe"
              onPress={() => {}}
              variant="secondary"
              size="sm"
              className="mt-4 self-start"
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Rehome Card Component ──────────────────────

function RehomeCard({ item }: { item: CommunityRehome }) {
  return (
    <View
      style={{
        width: 220,
        backgroundColor: "#ffffff",
        borderRadius: 24,
        overflow: "hidden",
        shadowColor: "#191c1d",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: 220, height: 144 }}
        resizeMode="cover"
      />
      <View className="p-4 gap-2">
        <Text className="text-xs font-semibold text-outline uppercase tracking-widest">
          {item.brand}
        </Text>
        <Text className="text-sm font-bold text-on-surface" numberOfLines={1}>
          {item.productName}
        </Text>
        <View className="flex-row items-center justify-between mt-1">
          <View className="flex-row items-center gap-1">
            <Text className="text-amber-500 text-xs">★</Text>
            <Text className="text-xs font-semibold text-on-surface">
              {item.rating}
            </Text>
          </View>
          {item.provenanceVerified && (
            <Badge
              label="Verified"
              variant="verified"
              icon={<ShieldCheck size={10} color="#012d1d" />}
            />
          )}
        </View>
      </View>
    </View>
  );
}
