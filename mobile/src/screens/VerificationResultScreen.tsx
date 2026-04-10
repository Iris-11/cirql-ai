/**
 * VerificationResultScreen — Displays real E1 + E2 + E3 results.
 * User must pick an action (resale / donate / recycle) to finalise the listing.
 */

// @ts-ignore — React 19.1 + TS 5.9 false-positive
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import {
  ArrowLeft,
  ShieldCheck,
  Eye,
  Clock,
  CheckCircle,
  Tag,
  Heart,
  RefreshCw,
} from "lucide-react-native";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { CircularProgress } from "../components/ui/CircularProgress";
import { confirmAction } from "../api/services/productService";
import type { RootStackParamList, FullPipelineResult } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "VerificationResult">;
type Action = "resale" | "donate" | "recycle";

const RESALE_TIERS = ["near_mint", "excellent"];

function tierColor(score: number): string {
  if (score >= 80) return "#1F6F54";
  if (score >= 60) return "#C49B5F";
  return "#ba1a1a";
}

export function VerificationResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const params = route.params as any;

  const result: FullPipelineResult | null = params?.result ?? null;
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!result) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center" edges={["top"]}>
        <Clock size={48} color="#717973" />
        <Text className="text-lg font-bold text-on-surface mt-4 text-center px-8">
          Result Not Available Yet
        </Text>
        <Text className="text-sm text-outline mt-2 text-center px-8">
          Your submission is still being processed. Check back shortly.
        </Text>
        <Button title="Go Home" onPress={() => navigation.popToTop()} className="mt-6" />
      </SafeAreaView>
    );
  }

  const { e1_result, e2_result, e3_result, confidence_score, pending_review } = result;

  // ── Pending manual approval (low confidence) ──────────────────────────────
  if (pending_review) {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
        <View className="flex-row items-center px-6 py-3 gap-4">
          <TouchableOpacity onPress={() => navigation.popToTop()}>
            <ArrowLeft size={24} color="#191c1d" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-on-surface">Verification Result</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-amber-50 rounded-full p-6 mb-6">
            <Clock size={40} color="#C49B5F" />
          </View>
          <Text className="text-2xl font-bold text-on-surface text-center">
            Sent for Manual Approval
          </Text>
          <Text className="text-sm text-outline text-center mt-3 leading-5">
            Our AI flagged some uncertainty with your submission (confidence:{" "}
            {Math.round(confidence_score * 100)}%). A WS specialist will review your
            product within 24–48 hours.
          </Text>
          <Card variant="cream" className="mt-6 w-full">
            <Text className="text-sm font-bold text-on-surface mb-2">What happens next?</Text>
            <Text className="text-xs text-outline leading-5">
              • Our team reviews your photos and product details{"\n"}
              • You'll be notified once a decision is made{"\n"}
              • Approved items will proceed to next-life routing
            </Text>
          </Card>
          <Button title="Go Home" onPress={() => navigation.popToTop()} className="mt-8" size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Resale eligibility: eligible_for_resale OR tier is near_mint / excellent ──
  const resaleEnabled =
    e2_result.eligible_for_resale &&
    RESALE_TIERS.includes((e2_result.tier ?? "").toLowerCase());

  const handleConfirm = async () => {
    if (!selectedAction) return;
    setConfirming(true);
    try {
      await confirmAction(result.listing_id, selectedAction);
      setConfirmed(true);
    } catch {
      Alert.alert("Error", "Could not confirm your selection. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  // ── Post-confirmation success view ────────────────────────────────────────
  if (confirmed && selectedAction) {
    const labels: Record<Action, string> = {
      resale: "Listed for Resale",
      donate: "Scheduled for Donation",
      recycle: "Scheduled for Recycling",
    };
    const messages: Record<Action, string> = {
      resale: "Your item has been listed. You'll be notified when a buyer is matched.",
      donate: "Thank you! Your item will be donated to a partner in need.",
      recycle: "Your item will be responsibly recycled through our partner network.",
    };
    const action = selectedAction as Action;
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center px-8" edges={["top"]}>
        <View className="bg-secondary-fixed rounded-full p-6 mb-6">
          <CheckCircle size={40} color="#1F6F54" />
        </View>
        <Text className="text-2xl font-bold text-on-surface text-center">{labels[action]}</Text>
        <Text className="text-sm text-outline text-center mt-3 leading-5">
          {messages[action]}
        </Text>
        {e3_result && (
          <Card variant="cream" className="mt-6 w-full">
            <Text className="text-xs font-semibold text-outline mb-1">Partner</Text>
            <Text className="text-sm font-bold text-on-surface">{e3_result.partner}</Text>
            <View className="flex-row gap-4 mt-3">
              <Text className="text-xs text-outline">
                🌿 {e3_result.impact.co2_avoided_kg}kg CO₂ avoided
              </Text>
              <Text className="text-xs text-outline">
                ♻️ {e3_result.impact.landfill_diverted_kg}kg diverted
              </Text>
            </View>
          </Card>
        )}
        <Button title="Go Home" onPress={() => navigation.popToTop()} className="mt-8" size="lg" />
      </SafeAreaView>
    );
  }

  // ── Full result ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-row items-center px-6 py-3 gap-4">
        <TouchableOpacity onPress={() => navigation.popToTop()}>
          <ArrowLeft size={24} color="#191c1d" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-on-surface">Verification Result</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Condition Score ── */}
        <View className="px-6 mt-4">
          <Card variant="elevated" className="items-center py-8">
            <CircularProgress
              value={e2_result.score}
              size={180}
              strokeWidth={14}
              label="/ 100"
              sublabel="Condition Score"
              color={tierColor(e2_result.score)}
            />
            <Badge
              label={e2_result.tier}
              variant={e2_result.score >= 60 ? "tier" : "warning"}
              className="mt-5"
            />
            {e2_result.ws_approved && (
              <Badge
                label="WS Approved"
                variant="verified"
                icon={<ShieldCheck size={10} color="#012d1d" />}
                className="mt-2"
              />
            )}
            <Text className="text-xs text-outline mt-3">
              AI Confidence: {Math.round(confidence_score * 100)}%
            </Text>
          </Card>
        </View>

        {/* ── E1 Authenticity ── */}
        <View className="px-6 mt-4">
          <Card variant="flat">
            <View className="flex-row items-center gap-2 mb-3">
              <CheckCircle size={16} color="#1F6F54" />
              <Text className="text-sm font-bold text-on-surface">Image Verification</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-outline">Authenticity Score</Text>
              <Text className="text-xs font-semibold text-on-surface">
                {Math.round(e1_result.authenticity_score * 100)}%
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-outline">SKU Match</Text>
              <Text className={`text-xs font-semibold ${e1_result.sku_match ? "text-primary" : "text-error"}`}>
                {e1_result.sku_match ? "Confirmed" : "Mismatch"}
              </Text>
            </View>
            {e1_result.damage_detected && e1_result.damage_summary && (
              <View className="mt-2 bg-amber-50 rounded-lg p-3">
                <Text className="text-xs font-semibold text-amber-700 mb-1">Damage Detected</Text>
                <Text className="text-xs text-amber-600 leading-4">{e1_result.damage_summary}</Text>
              </View>
            )}
            {e1_result.flags.filter((f: string) => f !== "no_exif_data").length > 0 && (
              <View className="mt-2 flex-row flex-wrap gap-1">
                {e1_result.flags
                  .filter((f: string) => f !== "no_exif_data")
                  .map((flag: string) => (
                    <View key={flag} className="bg-surface-container rounded-full px-2 py-0.5">
                      <Text className="text-xs text-outline">{flag.replace(/_/g, " ")}</Text>
                    </View>
                  ))}
              </View>
            )}
          </Card>
        </View>

        {/* ── AI Condition Report ── */}
        <View className="px-6 mt-4">
          <Card variant="cream">
            <Text className="text-sm font-bold text-on-surface mb-2">AI Condition Report</Text>
            <Text className="text-sm text-on-surface leading-5">{e2_result.report_text}</Text>
          </Card>
        </View>

        {/* ── Evidence ── */}
        {e2_result.evidence && e2_result.evidence.length > 0 && (
          <View className="px-6 mt-4">
            <Text className="text-base font-bold text-on-surface mb-3">Evidence Analysis</Text>
            <View className="gap-3">
              {e2_result.evidence.map((e: any, i: number) => (
                <View key={i}>
                  <Card variant="flat" className="flex-row items-start gap-3 py-4">
                    <View className="bg-surface-container rounded-full p-2">
                      <Eye size={16} color="#717973" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-outline uppercase tracking-wider">
                        {String(e.source)
                          .replace(/^passport\./i, "")
                          .replace(/_/g, " ")}
                      </Text>
                      <Text className="text-sm text-on-surface mt-1 leading-5">{e.claim}</Text>
                    </View>
                  </Card>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Suggested Price ── */}
        {e2_result.suggested_price != null && (
          <View className="px-6 mt-4">
            <Card variant="elevated">
              <Text className="text-sm font-bold text-on-surface">Suggested Resale Price</Text>
              <Text className="text-3xl font-bold text-primary mt-1">
                ${e2_result.suggested_price.toFixed(2)}
              </Text>
              <Text className="text-xs text-outline mt-1">
                Based on condition, market data, and original retail price
              </Text>
            </Card>
          </View>
        )}

        {/* ── E3 AI Recommendation ── */}
        {e3_result && (
          <View className="px-6 mt-4">
            <Card variant="cream">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-sm font-bold text-on-surface">AI Recommendation</Text>
                <Badge
                  label={e3_result.action.charAt(0).toUpperCase() + e3_result.action.slice(1)}
                  variant={e3_result.action === "resale" ? "tier" : "verified"}
                />
              </View>
              <Text className="text-sm text-on-surface leading-5">{e3_result.reason}</Text>
              <Text className="text-xs font-semibold text-outline mt-2">
                Partner: {e3_result.partner}
              </Text>
              <View className="flex-row gap-4 mt-3">
                <Text className="text-xs text-outline">
                  🌿 {e3_result.impact.co2_avoided_kg}kg CO₂ avoided
                </Text>
                <Text className="text-xs text-outline">
                  ♻️ {e3_result.impact.landfill_diverted_kg}kg diverted
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* ── SKU Mismatch block ── */}
        {!e1_result.sku_match && (
          <View className="px-6 mt-6">
            <Card variant="flat">
              <View className="bg-red-100 rounded-xl p-4 items-center">
                <Text className="text-base font-bold text-red-700 text-center mb-1">
                  Product Does Not Match
                </Text>
                <Text className="text-sm text-red-600 text-center leading-5">
                  The photos you submitted do not match the registered product in our system.
                  Please re-submit with the correct item or contact support.
                </Text>
                <Button
                  title="Go Home"
                  onPress={() => navigation.popToTop()}
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                />
              </View>
            </Card>
          </View>
        )}

        {/* ── Choose Next Life (only if SKU matched) ── */}
        {e1_result.sku_match && <View className="px-6 mt-6">
          <Text className="text-base font-bold text-on-surface mb-1">Choose Next Life</Text>
          <Text className="text-xs text-outline mb-4">
            Select how you'd like to proceed with this item.
          </Text>

          {/* Resale */}
          <TouchableOpacity
            onPress={() => resaleEnabled && setSelectedAction("resale")}
            activeOpacity={resaleEnabled ? 0.7 : 1}
          >
            <View
              className={`rounded-2xl border-2 p-4 mb-3 flex-row items-center gap-4 ${selectedAction === "resale"
                  ? "border-primary bg-secondary-fixed"
                  : resaleEnabled
                    ? "border-surface-container-high bg-surface-container"
                    : "border-surface-container bg-surface-container opacity-40"
                }`}
            >
              <View className="bg-white rounded-full p-2">
                <Tag size={20} color="#1F6F54" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-on-surface">List for Resale</Text>
                <Text className="text-xs text-outline mt-0.5">
                  {resaleEnabled
                    ? "Sell to a new owner via the WS marketplace"
                    : "Not eligible — condition too low for resale"}
                </Text>
              </View>
              {selectedAction === "resale" && (
                <CheckCircle size={20} color="#1F6F54" />
              )}
            </View>
          </TouchableOpacity>

          {/* Donate */}
          <TouchableOpacity onPress={() => setSelectedAction("donate")} activeOpacity={0.7}>
            <View
              className={`rounded-2xl border-2 p-4 mb-3 flex-row items-center gap-4 ${selectedAction === "donate"
                  ? "border-primary bg-secondary-fixed"
                  : "border-surface-container-high bg-surface-container"
                }`}
            >
              <View className="bg-white rounded-full p-2">
                <Heart size={20} color="#1F6F54" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-on-surface">Donate</Text>
                <Text className="text-xs text-outline mt-0.5">
                  Give to a charity or community partner
                </Text>
              </View>
              {selectedAction === "donate" && (
                <CheckCircle size={20} color="#1F6F54" />
              )}
            </View>
          </TouchableOpacity>

          {/* Recycle */}
          <TouchableOpacity onPress={() => setSelectedAction("recycle")} activeOpacity={0.7}>
            <View
              className={`rounded-2xl border-2 p-4 mb-3 flex-row items-center gap-4 ${selectedAction === "recycle"
                  ? "border-primary bg-secondary-fixed"
                  : "border-surface-container-high bg-surface-container"
                }`}
            >
              <View className="bg-white rounded-full p-2">
                <RefreshCw size={20} color="#1F6F54" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-on-surface">Recycle</Text>
                <Text className="text-xs text-outline mt-0.5">
                  Responsibly recycled through our partner network
                </Text>
              </View>
              {selectedAction === "recycle" && (
                <CheckCircle size={20} color="#1F6F54" />
              )}
            </View>
          </TouchableOpacity>
        </View>}

        {/* ── Confirm Button (only if SKU matched) ── */}
        {e1_result.sku_match && <View className="px-6 mt-4 mb-4">
          {confirming ? (
            <View className="items-center py-4">
              <ActivityIndicator color="#1F6F54" />
              <Text className="text-xs text-outline mt-2">Confirming your choice...</Text>
            </View>
          ) : (
            <Button
              title={selectedAction ? `Confirm — ${selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)}` : "Select an option above"}
              onPress={handleConfirm}
              disabled={!selectedAction}
              size="lg"
            />
          )}
        </View>}
      </ScrollView>
    </SafeAreaView>
  );
}
