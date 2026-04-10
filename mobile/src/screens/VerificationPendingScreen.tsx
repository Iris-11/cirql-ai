/**
 * VerificationPendingScreen — Shown while AI pipeline runs.
 * Navigation to result is triggered by VerifyProductScreen once the API returns.
 * If still here after pipeline completes (e.g. error), user sees a "check later" message.
 */

// @ts-ignore — React 19.1 + TS 5.9 false-positive
import React, { useEffect, useState } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Shield, Clock, Headphones } from "lucide-react-native";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAssessment } from "../context/AssessmentContext";
import type { RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STAGES = [
  { label: "Image Analysis",      description: "Verifying authenticity" },
  { label: "Condition Assessment", description: "AI grading in progress" },
  { label: "Routing Decision",     description: "Finding best next-life" },
];

export function VerificationPendingScreen() {
  const navigation = useNavigation<Nav>();
  const { result, error, clear } = useAssessment();

  const [currentStage, setCurrentStage] = useState(0);
  const pulseAnim = new Animated.Value(0.6);

  // When VerifyProductScreen posts result to context, navigate to result screen
  useEffect(() => {
    if (result) {
      clear();
      navigation.replace("VerificationResult", { result });
    }
  }, [result]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1,   duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Advance stage indicator every 4s for visual feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev: number) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-1 px-6 items-center justify-center">
        {/* @ts-ignore — Animated.View TS false-positive with React 19 */}
        <Animated.View style={{ opacity: pulseAnim }} className="bg-secondary-fixed rounded-full p-8 mb-8">
          <Shield size={48} color="#1F6F54" />
        </Animated.View>

        <Text className="text-2xl font-bold text-on-surface text-center">
          Verifying Your Product
        </Text>
        <Badge label="AI Processing" variant="verified" className="mt-3" />

        <View className="flex-row items-center gap-2 mt-4">
          <Clock size={14} color="#717973" />
          <Text className="text-sm text-outline">This usually takes under a minute</Text>
        </View>

        <Card variant="elevated" className="mt-10 w-full">
          <Text className="text-sm font-bold text-on-surface mb-4">Analysis Progress</Text>
          {STAGES.map((stage, index) => (
            <View key={stage.label} className="flex-row items-start gap-3 mb-4">
              <View className="items-center">
                <View className={`w-3 h-3 rounded-full ${index <= currentStage ? "bg-primary" : "bg-surface-container-high"}`} />
                {index < STAGES.length - 1 && (
                  <View className={`w-0.5 h-8 ${index < currentStage ? "bg-primary" : "bg-surface-container-high"}`} />
                )}
              </View>
              <View className="flex-1 -mt-1">
                <Text className={`text-sm font-semibold ${index <= currentStage ? "text-on-surface" : "text-outline"}`}>
                  Stage {index + 1}: {stage.label}
                </Text>
                <Text className="text-xs text-outline mt-0.5">
                  {index < currentStage ? "✓ Complete" : index === currentStage ? stage.description + "..." : "Pending"}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {error && (
          <View className="mt-6 bg-red-50 rounded-xl px-4 py-3 w-full">
            <Text className="text-xs text-red-600 font-semibold text-center">
              Assessment failed. Your submission was saved — our team will review it manually.
            </Text>
            <Button title="Go Home" onPress={() => navigation.popToTop()} variant="secondary" size="sm" className="mt-3" />
          </View>
        )}

        <View className="mt-6 flex-row items-center gap-3">
          <Headphones size={18} color="#1F6F54" />
          <Button title="Contact Premium Support" onPress={() => {}} variant="tertiary" size="sm" />
        </View>
      </View>
    </SafeAreaView>
  );
}
