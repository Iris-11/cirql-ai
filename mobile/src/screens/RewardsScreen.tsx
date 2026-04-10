import React from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Typography, Button } from '../components/ui';
import { TopAppBar } from '../components/TopAppBar';
import { useRewards } from '../hooks/api';
import { Gem, ArrowRight } from 'lucide-react-native';
import { COLORS } from '../styles/theme';

export const RewardsScreen = () => {
  const { data: rewards, isLoading } = useRewards();

  return (
    <View className="flex-1 bg-background">
      <TopAppBar />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* REWARDS STATUS HERO */}
        <View className="px-6 pt-10 pb-8">
           <View className="bg-primary p-8 rounded-3xl overflow-hidden relative">
              {/* Background Accent */}
              <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
              
              <Typography variant="label" size="sm" className="text-white/60 mb-2">Available Balance</Typography>
              <Typography variant="display" size="xl" className="text-white text-5xl mb-6">2,450 pts</Typography>
              
              <View className="h-1.5 w-full bg-white/20 rounded-full mb-3">
                 <View className="h-full w-[70%] bg-white rounded-full" />
              </View>
              
              <View className="flex-row items-center justify-between">
                 <Typography variant="label" size="sm" className="text-white/80 lowercase">Sustainability Pioneer</Typography>
                 <Typography variant="label" size="sm" className="text-white">70% to Guardian</Typography>
              </View>
           </View>
        </View>

        {/* CURATED REWARDS SECTION */}
        <View className="px-6 mb-6">
          <Typography variant="headline" size="lg" className="text-primary">Curated Rewards</Typography>
          <Typography variant="body" size="sm" className="text-primary/50">Exclusive offers for our circular culinary members.</Typography>
        </View>

        <View className="px-6 space-y-4">
           {rewards?.map((reward) => (
             <TouchableOpacity 
               key={reward.id}
               activeOpacity={0.9}
               className="bg-white rounded-2xl p-4 flex-row items-center shadow-premium mb-4"
             >
                <View className="w-20 h-20 bg-cream/30 rounded-xl overflow-hidden mr-4">
                   <Image source={{ uri: reward.image }} className="w-full h-full" />
                </View>
                
                <View className="flex-1">
                   <Typography variant="label" size="sm" className="text-primary/50 text-[10px] mb-1">{reward.category}</Typography>
                   <Typography variant="headline" size="md" className="text-primary mb-1">{reward.title}</Typography>
                   <View className="flex-row items-center">
                      <Gem size={12} color={COLORS.primary} className="mr-2" />
                      <Typography variant="label" size="sm" className="text-primary ml-1">{reward.points} Pts</Typography>
                   </View>
                </View>
                
                <View className="bg-primary/5 p-2 rounded-full">
                   <ArrowRight size={18} color={COLORS.primary} />
                </View>
             </TouchableOpacity>
           ))}
        </View>

        {/* PROVENANCE COMMITMENT */}
        <View className="px-6 mt-8">
           <View className="border-t border-primary/10 pt-8 pb-4">
              <Typography variant="headline" size="md" className="text-primary mb-2">Our Provenance Commitment</Typography>
              <Typography variant="body" size="sm" className="text-primary/60 leading-relaxed">
                By participating in the Rewards program, you are directly funding the restoration of heirloom kitchen tools and supporting zero-waste culinary education.
              </Typography>
           </View>
        </View>
      </ScrollView>
    </View>
  );
};
