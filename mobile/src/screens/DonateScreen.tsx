/**
 * DonateScreen — Browse all donation partners and select one.
 * Guides the user to visit or contact the partner to arrange drop-off.
 */

// @ts-ignore — React 19.1 + TS 5.9 false-positive
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import {
  ArrowLeft,
  Heart,
  MapPin,
  CheckCircle,
  Tag,
  Phone,
  Navigation,
  Info,
} from "lucide-react-native";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { usePartners } from "../hooks/useImpact";
import { confirmAction } from "../api/services/productService";
import type { RootStackParamList, Partner } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "DonateProduct">;

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Pick a Partner",
    desc: "Choose a donation partner that accepts your product category.",
  },
  {
    step: "2",
    title: "Contact or Visit",
    desc: "Call ahead or walk in to your nearest partner location to arrange a drop-off.",
  },
  {
    step: "3",
    title: "Confirm in App",
    desc: "Tap Confirm below so CIRQL can record your donation and award impact points.",
  },
];

export function DonateScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { listingId } = route.params;

  const { data: partners, isLoading } = usePartners();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const donatePartners = partners?.donate ?? [];

  const handleConfirm = async () => {
    if (!selectedId) return;
    setConfirming(true);
    try {
      await confirmAction(listingId, "donate");
      navigation.popToTop();
    } catch {
      Alert.alert("Error", "Could not confirm. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-3 gap-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#191c1d" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-on-surface">Donate Product</Text>
          <Text className="text-xs text-outline mt-0.5">
            Give your item a meaningful second life
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1F6F54" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          {/* How It Works */}
          <View className="mt-4">
            <Text className="text-base font-bold text-on-surface mb-3">
              How It Works
            </Text>
            <Card variant="flat" className="gap-0 py-2">
              {HOW_IT_WORKS.map((item, i) => (
                <View key={item.step}>
                  <View className="flex-row items-start gap-3 py-3">
                    <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                      <Text className="text-xs font-bold text-white">{item.step}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-on-surface">{item.title}</Text>
                      <Text className="text-xs text-outline mt-0.5 leading-4">{item.desc}</Text>
                    </View>
                  </View>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <View className="ml-3.5 w-0.5 h-3 bg-surface-container-high" />
                  )}
                </View>
              ))}
            </Card>
          </View>

          {/* Contact note */}
          <View className="mt-4 flex-row items-start gap-2 bg-secondary-fixed rounded-2xl px-4 py-3">
            <Info size={14} color="#1F6F54" />
            <Text className="flex-1 text-xs text-primary leading-4 font-medium">
              You can visit any partner location directly or call ahead to confirm they can receive your item before making the trip.
            </Text>
          </View>

          {/* Partner List */}
          <View className="flex-row items-center justify-between mt-6 mb-3">
            <Text className="text-base font-bold text-on-surface">
              Donation Partners
            </Text>
            <Badge label={`${donatePartners.length} available`} variant="verified" />
          </View>

          {donatePartners.length === 0 ? (
            <Card variant="flat" className="items-center py-8">
              <Text className="text-sm text-outline">
                No donation partners available right now.
              </Text>
            </Card>
          ) : (
            donatePartners.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                selected={selectedId === partner.id}
                onSelect={() =>
                  setSelectedId(selectedId === partner.id ? null : partner.id)
                }
                icon={<Heart size={20} color="#1F6F54" />}
                actionVerb="donate to"
              />
            ))
          )}

          {/* Confirm */}
          <View className="mt-6">
            {confirming ? (
              <View className="items-center py-4">
                <ActivityIndicator color="#1F6F54" />
                <Text className="text-xs text-outline mt-2">Confirming…</Text>
              </View>
            ) : (
              <Button
                title={selectedId ? "Confirm — I've Arranged My Donation" : "Select a Partner Above"}
                onPress={handleConfirm}
                disabled={!selectedId}
                size="lg"
              />
            )}
            {selectedId && (
              <Text className="text-xs text-outline text-center mt-2 leading-4">
                Only confirm once you've contacted the partner or visited them in person.
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Partner Card ───────────────────────────────

function PartnerCard({
  partner,
  selected,
  onSelect,
  icon,
  actionVerb,
}: {
  partner: Partner;
  selected: boolean;
  onSelect: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  actionVerb: string;
  key?: string;
}) {
  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.8} className="mb-3">
      <Card
        variant="elevated"
        className={`border-2 ${selected ? "border-primary" : "border-transparent"}`}
      >
        {/* Top row */}
        <View className="flex-row items-start gap-3">
          <View className="bg-secondary-fixed rounded-2xl p-3">{icon}</View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-on-surface flex-1 pr-2">
                {partner.name}
              </Text>
              {selected && <CheckCircle size={18} color="#1F6F54" />}
            </View>

            {/* Regions */}
            {partner.regions.length > 0 && (
              <View className="flex-row items-center gap-1 mt-2 flex-wrap">
                <MapPin size={11} color="#717973" />
                <Text className="text-xs text-outline">
                  {partner.regions.join(" · ")}
                </Text>
              </View>
            )}

            {/* Accepted Categories */}
            {partner.accepted_categories.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5 mt-2">
                {partner.accepted_categories.map((cat) => (
                  <Badge
                    key={cat}
                    label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                    variant="status"
                    icon={<Tag size={9} color="#717973" />}
                  />
                ))}
              </View>
            )}

            {/* Min Condition */}
            {partner.min_condition_tier && (
              <Text className="text-xs text-outline mt-2">
                Min condition:{" "}
                <Text className="font-semibold text-on-surface">
                  {partner.min_condition_tier}
                </Text>
              </Text>
            )}
          </View>
        </View>

        {/* Divider + Contact / Directions hint */}
        <View className="mt-4 pt-3 border-t border-surface-container-high flex-row gap-3">
          <View className="flex-1 flex-row items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2">
            <Navigation size={13} color="#1F6F54" />
            <Text className="text-xs font-medium text-primary">
              Visit in person
            </Text>
          </View>
          <View className="flex-1 flex-row items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2">
            <Phone size={13} color="#1F6F54" />
            <Text className="text-xs font-medium text-primary">
              Call ahead
            </Text>
          </View>
        </View>

        {selected && (
          <View className="mt-3 bg-secondary-fixed rounded-xl px-3 py-2">
            <Text className="text-xs text-primary font-medium text-center leading-4">
              Great choice! Contact or visit {partner.name} to {actionVerb} your item, then confirm below.
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}
