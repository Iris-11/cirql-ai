import React from 'react';
import { View, ScrollView, RefreshControl, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Typography, Button } from '../components/ui';
import { TopAppBar } from '../components/TopAppBar';
import { useImpactMetrics, useRecentRehomes } from '../hooks/api';
import { Leaf, Activity } from 'lucide-react-native';
import { COLORS } from '../styles/theme';

export const HomeScreen = () => {
  const { data: metrics, isLoading: loadingMetrics, refetch: refetchMetrics } = useImpactMetrics();
  const { data: rehomes, isLoading: loadingRehomes, refetch: refetchRehomes } = useRecentRehomes();
  const navigation = useNavigation<any>();

  const onRefresh = () => {
    refetchMetrics();
    refetchRehomes();
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  return (
    <View className="flex-1 bg-background">
      <TopAppBar />
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={loadingMetrics || loadingRehomes} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* IMPACT HERO */}
        <View className="px-6 pt-10 pb-8">
          <Typography variant="label" size="sm" className="text-primary/60 mb-2">
            Community Impact
          </Typography>
          <Typography variant="display" size="xl" className="text-primary leading-tight mb-4">
            Together we've saved{"\n"}
            <Text className="font-noto-bold text-4xl">
              {formatNumber(metrics?.totalCo2SavedKg)} kg
            </Text>{"\n"}
            of CO2
          </Typography>
          
          <View className="flex-row items-center bg-primary/5 self-start px-4 py-2 rounded-full border border-primary/10">
            <Activity size={14} color={COLORS.primary} />
            <Typography variant="label" size="sm" className="text-primary ml-2 lowercase">
              +{metrics?.dailyOffsetKg}kg Carbon Offset Today
            </Typography>
          </View>
        </View>

        {/* METRICS QUICK VIEW */}
        <View className="flex-row px-6 space-x-4 mb-10">
          <View className="flex-1 bg-cream/40 p-5 rounded-2xl">
            <Typography variant="display" size="lg" className="text-primary capitalize">
              {metrics?.wasteReductionPct}%
            </Typography>
            <Typography variant="body" size="sm" className="text-primary/60">
              Waste Reduction
            </Typography>
          </View>
          <View className="flex-1 bg-cream/40 p-5 rounded-2xl">
            <Typography variant="display" size="lg" className="text-primary">
              {formatNumber(metrics?.totalToolsSaved)}
            </Typography>
            <Typography variant="body" size="sm" className="text-primary/60">
              Tools Saved
            </Typography>
          </View>
        </View>

        {/* RECENT REHOMES SECTION */}
        <View className="px-6 mb-6 flex-row items-center justify-between">
          <Typography variant="headline" size="lg" className="text-primary">
            Recent Community Rehomes
          </Typography>
          <Typography variant="label" size="sm" className="text-primary/60 underline">
            Explore All
          </Typography>
        </View>

        <FlatList
          data={rehomes}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 24, paddingRight: 24 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="w-72 mr-6 bg-white rounded-2xl overflow-hidden shadow-premium">
              <Image source={{ uri: item.image }} className="h-48 w-full bg-cream/20" />
              <View className="p-4">
                <Typography variant="label" size="sm" className="text-primary/50 mb-1">
                  Rehomed by {item.rehomedBy}
                </Typography>
                <Typography variant="headline" size="md" className="text-primary mb-2">
                  {item.name}
                </Typography>
                <View className="flex-row items-center justify-between">
                   <View className="bg-primary/5 px-2 py-0.5 rounded-full">
                      <Typography variant="label" size="sm" className="text-[9px] text-primary">
                        {item.condition}
                      </Typography>
                   </View>
                   <View className="flex-row items-center">
                     <Leaf size={12} color={COLORS.primary} fill={COLORS.primary} />
                     <Typography variant="label" size="sm" className="ml-1 text-[10px]">
                        {item.rating}
                     </Typography>
                   </View>
                </View>
              </View>
            </View>
          )}
        />

        {/* CTA SECTION */}
        <View className="px-6 mt-12">
          <View className="bg-primary p-8 rounded-3xl">
            <Typography variant="display" size="lg" className="text-white mb-2">
              Join the Circular{"\n"}Culinary Movement
            </Typography>
            <Typography variant="body" size="md" className="text-white/80 mb-6 font-manrope-reg">
              Receive exclusive access to heritage drops and monthly impact reports.
            </Typography>
            <Button 
               label="Get Started" 
               variant="secondary" 
               className="bg-white" 
               onPress={() => navigation.navigate('VerifyFlow')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Inline Text component for the specialized display
const Text = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <Typography variant="display" className={className}>{children}</Typography>
);
