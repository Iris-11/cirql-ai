import React from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Typography, Button } from '../components/ui';
import { TopAppBar } from '../components/TopAppBar';
import { Leaf, Award, AlertCircle, Info, ChevronRight, Share2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../styles/theme';

export const VerificationResultScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-background">
      <TopAppBar />
      <ScrollView className="flex-1 px-6 pt-8 pb-32" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* MAGIC MOMENT HEADER */}
        <View className="items-center mb-10">
           <View className="w-40 h-40 rounded-full border-8 border-primary/5 items-center justify-center relative mb-6">
              <Typography variant="display" size="xl" className="text-primary text-5xl">75</Typography>
              <Typography variant="label" size="sm" className="text-primary/40">Condition Score</Typography>
              
              <View className="absolute -top-2 -right-2 bg-secondary-fixed p-2 rounded-full">
                 <Leaf size={16} color={COLORS.primary} fill={COLORS.primary} />
              </View>
           </View>
           
           <Typography variant="label" size="sm" className="text-primary/50 mb-1">Assessed Tier</Typography>
           <Typography variant="display" size="lg" className="text-primary text-4xl">GOOD</Typography>
        </View>

        {/* AI SUMMARY CARD */}
        <View className="bg-white p-6 rounded-3xl shadow-premium mb-8 border border-primary/5">
           <View className="flex-row items-center mb-4">
              <View className="bg-primary/5 p-2 rounded-lg mr-3">
                 <Info size={18} color={COLORS.primary} />
              </View>
              <Typography variant="headline" size="sm" className="text-primary">AI Condition Summary</Typography>
           </View>
           
           <Typography variant="body" size="md" className="text-primary/70 leading-relaxed mb-4">
              Detailed analysis detected minor surface scratches on the non-stick surface and slight enamel fading consistent with 24 months of moderate use. Structural integrity remains optimal for second-life performance.
           </Typography>
           
           {/* EVIDENCE TILES */}
           <View className="flex-row space-x-3">
              <View className="w-20 h-20 rounded-xl bg-cream/20 overflow-hidden">
                 <Image source={{ uri: 'https://images.vvg.io/williams-sonoma/evidence1.jpg' }} className="w-full h-full" />
              </View>
              <View className="w-20 h-20 rounded-xl bg-cream/20 overflow-hidden">
                 <Image source={{ uri: 'https://images.vvg.io/williams-sonoma/evidence2.jpg' }} className="w-full h-full" />
              </View>
              <View className="bg-primary/5 px-4 rounded-xl items-center justify-center flex-1">
                 <Typography variant="label" size="sm" className="text-primary text-[10px] text-center">4 more artifacts analyzed</Typography>
              </View>
           </View>
        </View>

        {/* RESALE STATUS / ACTION CARD */}
        <View className="bg-primary p-8 rounded-3xl mb-8 flex-row items-center justify-between shadow-premium">
           <View className="flex-1 mr-4">
              <Typography variant="label" size="sm" className="text-white/60 mb-1">Estimated Listing Value</Typography>
              <Typography variant="display" size="lg" className="text-white">$185.00</Typography>
           </View>
           <Button label="Trade-in" variant="secondary" className="bg-white min-w-[120px]" />
        </View>

        {/* LOOP CLOSURE PIVOT */}
        <View className="bg-cream/40 p-6 rounded-3xl border border-primary/5 items-center flex-row">
           <AlertCircle size={24} color={COLORS.primary} strokeWidth={1.5} />
           <View className="flex-1 ml-4 mr-2">
              <Typography variant="headline" size="sm" className="text-primary mb-0.5">Not ready for resale?</Typography>
              <Typography variant="body" size="sm" className="text-primary/60">Explore zero-waste donation or recycling options.</Typography>
           </View>
           <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <ChevronRight size={20} color={COLORS.primary} />
           </TouchableOpacity>
        </View>

        <View className="mt-10 flex-row justify-center space-x-8">
           <TouchableOpacity className="items-center">
              <Share2 size={24} color={COLORS.primary} strokeWidth={1} />
              <Typography variant="label" size="sm" className="text-primary/50 mt-2 lowercase">Share Report</Typography>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
