/**
 * ProfileScreen — User account, stats, and sign out
 */

import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MapPin,
  Mail,
  Star,
  Leaf,
  CreditCard,
  LogOut,
  User,
  ShieldCheck,
} from "lucide-react-native";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useUserProfile } from "../hooks/useImpact";
import { useAuth } from "../context/AuthContext";

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useUserProfile();

  // Initials fallback when no picture
  const initials = (user?.name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#1F6F54" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 py-3">
          <Text className="text-2xl font-bold text-on-surface">Profile</Text>
        </View>

        {/* Avatar + Name */}
        <View className="items-center px-6 mt-4">
          {user?.picture ? (
            <Image
              source={{ uri: user.picture }}
              style={{ width: 88, height: 88, borderRadius: 44 }}
            />
          ) : (
            <View
              style={{ width: 88, height: 88, borderRadius: 44 }}
              className="bg-primary items-center justify-center"
            >
              <Text className="text-3xl font-bold text-white">{initials}</Text>
            </View>
          )}

          <Text className="text-xl font-bold text-on-surface mt-3">
            {profile?.name ?? user?.name ?? "—"}
          </Text>

          {profile?.city ? (
            <View className="flex-row items-center gap-1 mt-1">
              <MapPin size={13} color="#717973" />
              <Text className="text-sm text-outline">{profile.city}</Text>
            </View>
          ) : null}

          <Badge
            label={profile?.is_secondary_buyer ? "Secondary Buyer" : "Primary Member"}
            variant={profile?.is_secondary_buyer ? "status" : "verified"}
            icon={<ShieldCheck size={11} color="#012d1d" />}
            className="mt-3"
          />
        </View>

        {/* Stats Row */}
        <View className="px-6 mt-6 flex-row gap-3">
          <StatCard
            icon={<CreditCard size={18} color="#1F6F54" />}
            value={`$${(profile?.store_credit_usd ?? 0).toFixed(2)}`}
            label="Store Credit"
          />
          <StatCard
            icon={<Star size={18} color="#1F6F54" />}
            value={(profile?.reward_points ?? 0).toLocaleString()}
            label="Reward Points"
          />
          <StatCard
            icon={<Leaf size={18} color="#1F6F54" />}
            value={String(profile?.green_badges ?? 0)}
            label="Green Badges"
          />
        </View>

        {/* Account Info */}
        <View className="px-6 mt-6">
          <Text className="text-base font-bold text-on-surface mb-3">
            Account Details
          </Text>
          <Card variant="elevated" className="gap-4">
            <InfoRow
              icon={<Mail size={16} color="#1F6F54" />}
              label="Email"
              value={profile?.email ?? user?.email ?? "—"}
            />
            <InfoRow
              icon={<MapPin size={16} color="#1F6F54" />}
              label="City"
              value={profile?.city ?? "Not set"}
            />
            <InfoRow
              icon={<User size={16} color="#1F6F54" />}
              label="Member type"
              value={profile?.is_secondary_buyer ? "Secondary Buyer" : "Primary Member"}
            />
          </Card>
        </View>

        {/* Sign Out */}
        <View className="px-6 mt-6">
          <TouchableOpacity
            onPress={signOut}
            activeOpacity={0.8}
            className="flex-row items-center justify-center gap-2 bg-error-container rounded-3xl py-4"
          >
            <LogOut size={18} color="#ba1a1a" />
            <Text className="text-base font-semibold text-error">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Stat Card ──────────────────────────────────

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <Card variant="elevated" className="flex-1 items-center py-4 px-2">
      <View className="bg-secondary-fixed rounded-full p-2 mb-2">{icon}</View>
      <Text className="text-base font-bold text-on-surface">{value}</Text>
      <Text className="text-xs text-outline mt-0.5 text-center">{label}</Text>
    </Card>
  );
}

// ── Info Row ───────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="bg-surface-container-low rounded-full p-2">{icon}</View>
      <View className="flex-1">
        <Text className="text-xs text-outline">{label}</Text>
        <Text className="text-sm font-semibold text-on-surface mt-0.5">{value}</Text>
      </View>
    </View>
  );
}
