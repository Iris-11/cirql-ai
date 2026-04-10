import React from 'react';
import { View, ScrollView, Image } from 'react-native';
import { Typography, Button } from '../components/ui';
import { TopAppBar } from '../components/TopAppBar';
import { ShieldCheck, Camera, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { COLORS } from '../styles/theme';

export const HowItWorksScreen = () => {
  return (
    <View className="flex-1 bg-background">
      <TopAppBar />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* EDITORIAL HERO */}
        <View className="px-6 pt-12 pb-12 items-center">
          <Typography variant="display" size="xl" className="text-primary text-center mb-4">
            Heritage That{"\n"}Lives On
          </Typography>
          <Typography variant="body" size="md" className="text-primary/60 text-center px-10">
            Learn how Williams-Sonoma and CIRQL redefine the lifecycle of premium kitchenware.
          </Typography>
        </View>

        {/* PHASED GUIDANCE */}
        <View className="px-6 space-y-12">
          {/* STEP 1: CURATE */}
          <View className="flex-row items-start">
            <View className="bg-primary w-10 h-10 rounded-full items-center justify-center mr-6">
              <Camera size={20} color="white" />
            </View>
            <View className="flex-1">
              <Typography variant="label" size="sm" className="text-primary/50 mb-1">Step 01</Typography>
              <Typography variant="headline" size="lg" className="text-primary mb-2">Curate</Typography>
              <Typography variant="body" size="md" className="text-primary/70 leading-relaxed">
                Use our AI-guided interface to capture high-precision photos of your product. Our system tracks the unique provenance of your heritage item.
              </Typography>
            </View>
          </View>

          {/* STEP 2: CERTIFY */}
          <View className="flex-row items-start">
            <View className="bg-primary w-10 h-10 rounded-full items-center justify-center mr-6">
              <ShieldCheck size={20} color="white" />
            </View>
            <View className="flex-1">
              <Typography variant="label" size="sm" className="text-primary/50 mb-1">Step 02</Typography>
              <Typography variant="headline" size="lg" className="text-primary mb-2">Certify</Typography>
              <Typography variant="body" size="md" className="text-primary/70 leading-relaxed">
                Leverage combined AI and expert human validation to receive a formal Digital Product Passport and heritage status certification.
              </Typography>
            </View>
          </View>

          {/* STEP 3: CIRCULATE */}
          <View className="flex-row items-start">
            <View className="bg-primary w-10 h-10 rounded-full items-center justify-center mr-6">
              <RefreshCw size={20} color="white" />
            </View>
            <View className="flex-1">
              <Typography variant="label" size="sm" className="text-primary/50 mb-1">Step 03</Typography>
              <Typography variant="headline" size="lg" className="text-primary mb-2">Circulate</Typography>
              <Typography variant="body" size="md" className="text-primary/70 leading-relaxed">
                Choose your loop: Resell to a new family, Donate to community culinary programs, or Recycle for material reclamation.
              </Typography>
            </View>
          </View>
        </View>

        {/* TRUST BADGES SECTION */}
        <View className="mt-16 px-6">
          <View className="bg-cream/40 p-8 rounded-3xl items-center">
            <Typography variant="label" size="sm" className="text-primary/40 mb-6">Our Commitments</Typography>
            
            <View className="flex-row flex-wrap justify-center gap-6">
              <View className="items-center w-24">
                <CheckCircle2 size={24} color={COLORS.primary} />
                <Typography variant="label" size="sm" className="text-[10px] text-primary mt-2 text-center">Digital Product Passport</Typography>
              </View>
              <View className="items-center w-24">
                <CheckCircle2 size={24} color={COLORS.primary} />
                <Typography variant="label" size="sm" className="text-[10px] text-primary mt-2 text-center">Heritage Status</Typography>
              </View>
              <View className="items-center w-24">
                <CheckCircle2 size={24} color={COLORS.primary} />
                <Typography variant="label" size="sm" className="text-[10px] text-primary mt-2 text-center">Zero-Waste Verified</Typography>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
