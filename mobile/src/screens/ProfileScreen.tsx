import React from 'react';
import { View, ScrollView, FlatList } from 'react-native';
import { Typography, Button } from '../components/ui';
import { TopAppBar } from '../components/TopAppBar';
import { ProductCard } from '../components/ProductCard';
import { usePortfolio } from '../hooks/api';
import { useNavigation } from '@react-navigation/native';
import { Trees, Award } from 'lucide-react-native';
import { COLORS } from '../styles/theme';

export const ProfileScreen = () => {
  const { data: portfolio, isLoading } = usePortfolio();
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-background">
      <TopAppBar />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* PERSONAL IMPACT DASHBOARD */}
        <View className="px-6 pt-10 pb-8 items-center">
          <View className="w-48 h-48 rounded-full border-4 border-primary/10 items-center justify-center relative mb-6">
            <Typography variant="display" size="xl" className="text-primary text-5xl">82</Typography>
            <Typography variant="label" size="sm" className="text-primary/40">Impact Score</Typography>
            
            {/* HERITAGE TIER BADGE */}
            <View className="absolute -bottom-2 bg-primary px-4 py-1.5 rounded-full flex-row items-center border-4 border-background">
               <Award size={14} color="white" />
               <Typography variant="label" size="sm" className="text-white ml-2">Heritage Tier</Typography>
            </View>
          </View>
          
          <Typography variant="body" size="md" className="text-primary/70 text-center px-12">
            You represent the top 5% of circular curators in the Williams-Sonoma community.
          </Typography>
        </View>

        {/* METRICS GRID */}
        <View className="px-6 mb-10">
          <View className="bg-primary/5 p-6 rounded-3xl flex-row items-center">
            <View className="bg-primary/10 p-4 rounded-full mr-6">
              <Trees size={32} color={COLORS.primary} strokeWidth={1.5} />
            </View>
            <View className="flex-1">
              <Typography variant="headline" size="md" className="text-primary mb-1">Equivalent to planting 2 young trees</Typography>
              <Typography variant="body" size="sm" className="text-primary/60">
                Based on your 2.5kg of CO2 avoided through circular trade-ins.
              </Typography>
            </View>
          </View>
        </View>

        {/* PRODUCT PORTFOLIO */}
        <View className="px-6 mb-6">
          <Typography variant="headline" size="lg" className="text-primary">Your Product Portfolio</Typography>
          <Typography variant="body" size="sm" className="text-primary/50">Manage and track your heritage items.</Typography>
        </View>

        <View className="px-6">
          {portfolio?.map((item) => (
            <ProductCard 
              key={item.id}
              name={item.name}
              brand={item.brand}
              status={item.status}
              sustainabilityScore={item.sustainabilityScore}
              image={item.image}
              onPress={() => {}}
            />
          ))}
        </View>

        <View className="px-6 mt-4">
           <Button label="Verify New Product" onPress={() => navigation.navigate('VerifyFlow')} />
        </View>
      </ScrollView>
    </View>
  );
};
