import React from 'react';
import { View, SafeAreaView } from 'react-native';
import { Typography, Button } from '../components/ui';
import { CheckCircle2, Trees, Gem, Clock, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../styles/theme';

export const ActionConfirmationScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 pt-12 items-center justify-center">
           {/* SUCCESS HERO */}
           <View className="bg-primary/5 w-32 h-32 rounded-full items-center justify-center mb-8">
              <CheckCircle2 size={64} color={COLORS.primary} strokeWidth={1.5} />
           </View>
           
           <Typography variant="display" size="lg" className="text-primary text-center mb-2">
             Action Confirmed
           </Typography>
           <Typography variant="body" size="md" className="text-primary/60 text-center px-12 mb-12">
             Your Le Creuset is on its way to its next culinary home.
           </Typography>

           {/* IMPACT CREATED CARD */}
           <View className="w-full bg-primary p-8 rounded-3xl shadow-premium mb-10 overflow-hidden relative">
              <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
              <Typography variant="label" size="sm" className="text-white/60 mb-6">Circular Value Created</Typography>
              
              <View className="flex-row items-center justify-between mb-4">
                 <View className="flex-row items-center">
                    <Trees size={20} color="white" />
                    <Typography variant="headline" size="sm" className="text-white ml-3">+2.5kg CO2 avoided</Typography>
                 </View>
                 <View className="h-6 w-6 rounded-full bg-white/20 items-center justify-center">
                    <ArrowRight size={10} color="white" />
                 </View>
              </View>
              
              <View className="flex-row items-center justify-between">
                 <View className="flex-row items-center">
                    <Gem size={20} color="white" />
                    <Typography variant="headline" size="sm" className="text-white ml-3">+150 Rewards Points</Typography>
                 </View>
                 <View className="h-6 w-6 rounded-full bg-white/20 items-center justify-center">
                    <ArrowRight size={10} color="white" />
                 </View>
              </View>
           </View>

           {/* LOGISTICS TIMELINE */}
           <View className="w-full bg-cream/20 p-6 rounded-2xl border border-primary/5">
              <View className="flex-row items-center mb-4">
                 <Clock size={16} color={COLORS.primary} />
                 <Typography variant="label" size="sm" className="text-primary ml-2 uppercase">The Journey Timeline</Typography>
              </View>
              
              <View className="flex-row items-center">
                 <View className="w-3 h-3 rounded-full bg-primary" />
                 <View className="h-0.5 flex-1 bg-primary/20 mx-2" />
                 <View className="w-3 h-3 rounded-full bg-primary/20" />
                 <View className="h-0.5 flex-1 bg-primary/20 mx-2" />
                 <View className="w-3 h-3 rounded-full bg-primary/20" />
              </View>
              
              <View className="flex-row justify-between mt-3">
                 <Typography variant="label" size="sm" className="text-primary text-[10px]">Your Home</Typography>
                 <Typography variant="label" size="sm" className="text-primary/40 text-[10px]">Processing Center</Typography>
                 <Typography variant="label" size="sm" className="text-primary/40 text-[10px]">Artisan Studio</Typography>
              </View>
           </View>
        </View>
        
        <View className="px-6 pb-12">
           <Button label="Return to Dashboard" onPress={() => navigation.navigate('Home')} />
        </View>
      </SafeAreaView>
    </View>
  );
};
