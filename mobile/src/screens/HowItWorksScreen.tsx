/**
 * HowItWorksScreen — Onboarding & trust building
 */

import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft, Camera, ShieldCheck, RefreshCw, Award, Leaf, Recycle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import type { RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HowItWorksScreen() {
  const navigation = useNavigation<Nav>();

  const phases = [
    {
      number: "01",
      title: "Curate",
      subtitle: "AI-Guided Capture",
      description:
        "Our intelligent camera guides you through capturing every angle of your product. Four precisely-angled photographs ensure accurate condition assessment.",
      icon: <Camera size={24} color="#1F6F54" />,
      color: "#1F6F54",
    },
    {
      number: "02",
      title: "Certify",
      subtitle: "AI + Human Validation",
      description:
        "Advanced AI analyzes authenticity and condition in seconds. For nuanced items, our heritage specialists provide white-glove review within hours.",
      icon: <ShieldCheck size={24} color="#2c694e" />,
      color: "#2c694e",
    },
    {
      number: "03",
      title: "Circulate",
      subtitle: "Resell, Donate, or Recycle",
      description:
        "Your product finds its highest-value second life. Whether resold at premium, donated to artisan programs, or responsibly recycled — nothing goes to waste.",
      icon: <RefreshCw size={24} color="#1b4332" />,
      color: "#1b4332",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-3 gap-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#191c1d" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-on-surface">How It Works</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="px-6 mt-6">
          <Text className="text-3xl font-bold text-on-surface leading-tight">
            Heritage That{"\n"}Lives On
          </Text>
          <Text className="text-base text-outline mt-3 leading-6">
            Every Williams-Sonoma product carries a story. CIRQL ensures that
            story continues — through verified provenance, intelligent routing,
            and measurable environmental impact.
          </Text>
        </View>

        {/* Phases */}
        <View className="px-6 mt-8 gap-5">
          {phases.map((phase) => (
            <Card key={phase.number} variant="elevated">
              <View className="flex-row items-start gap-4">
                <View
                  className="rounded-2xl p-3 items-center justify-center"
                  style={{ backgroundColor: `${phase.color}15` }}
                >
                  {phase.icon}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text
                      className="text-xs font-bold tracking-widest"
                      style={{ color: phase.color }}
                    >
                      PHASE {phase.number}
                    </Text>
                  </View>
                  <Text className="text-lg font-bold text-on-surface">
                    {phase.title}
                  </Text>
                  <Text className="text-sm text-outline mt-0.5 font-medium">
                    {phase.subtitle}
                  </Text>
                  <Text className="text-sm text-outline mt-3 leading-5">
                    {phase.description}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Trust Badges */}
        <View className="px-6 mt-8">
          <Text className="text-lg font-bold text-on-surface mb-4">
            Trust & Transparency
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <Badge
              label="Digital Product Passport"
              variant="verified"
              icon={<Award size={12} color="#012d1d" />}
            />
            <Badge
              label="Heritage Status"
              variant="tier"
              icon={<Leaf size={12} color="#ffffff" />}
            />
            <Badge
              label="Zero-Waste Verified"
              variant="verified"
              icon={<Recycle size={12} color="#012d1d" />}
            />
          </View>
        </View>

        {/* CTA */}
        <View className="px-6 mt-8">
          <LinearGradient
            colors={["#1F6F54", "#012d1d"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-7 items-center"
          >
            <Text className="text-xl font-bold text-white text-center">
              Ready to Begin?
            </Text>
            <Text className="text-sm text-white/70 text-center mt-2">
              Start verifying your products and earn rewards today.
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
