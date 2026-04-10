import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Typography, Button } from '../components/ui';
import { TopAppBar } from '../components/TopAppBar';
import { Recycle, Truck, Store, MapPin, ArrowRight, Info } from 'lucide-react-native';
import { COLORS } from '../styles/theme';

export const RecycleProductScreen = () => {
  return (
    <View className="flex-1 bg-background">
      <TopAppBar />
      <ScrollView className="flex-1 px-6 pt-10 pb-32">
        {/* IMPACT RECYCLE CARD */}
        <View className="bg-primary/5 p-8 rounded-3xl border border-primary/10 mb-10 items-center">
           <View className="bg-primary p-4 rounded-full mb-6">
              <Recycle size={32} color="white" />
           </View>
           <Typography variant="headline" size="lg" className="text-primary text-center mb-2">
             Close the Loop Responsibly
           </Typography>
           <Typography variant="body" size="md" className="text-primary/70 text-center px-4 leading-relaxed">
             Recycling this skillet saves <Typography variant="label" size="sm" className="text-primary lowercase">1.2kg of raw material</Typography> for future heritage tools. 
           </Typography>
        </View>

        {/* RECYCLING OPTIONS */}
        <Typography variant="label" size="sm" className="text-primary/40 mb-4 px-2">Select a Service Option</Typography>
        
        <View className="space-y-4">
           {/* OPTION 1: IN-STORE */}
           <TouchableOpacity 
             className="bg-white p-6 rounded-2xl flex-row items-center shadow-premium border border-primary/5 mb-4"
           >
              <View className="bg-cream/40 p-3 rounded-xl mr-5">
                 <Store size={24} color={COLORS.primary} strokeWidth={1.5} />
              </View>
              <View className="flex-1">
                 <Typography variant="headline" size="sm" className="text-primary mb-0.5">In-Store Drop-off</Typography>
                 <Typography variant="body" size="sm" className="text-primary/50">Return to your nearest Williams-Sonoma store.</Typography>
                 <View className="flex-row items-center mt-2">
                    <MapPin size={10} color={COLORS.primary} />
                    <Typography variant="label" size="sm" className="text-[10px] text-primary ml-1 lowercase">Find Nearest Store (2.4 miles)</Typography>
                 </View>
              </View>
              <ArrowRight size={18} color={COLORS.primary} opacity={0.3} />
           </TouchableOpacity>

           {/* OPTION 2: COURIER */}
           <TouchableOpacity 
             className="bg-white p-6 rounded-2xl flex-row items-center shadow-premium border border-primary/5 mb-4"
           >
              <View className="bg-cream/40 p-3 rounded-xl mr-5">
                 <Truck size={24} color={COLORS.primary} strokeWidth={1.5} />
              </View>
              <View className="flex-1">
                 <Typography variant="headline" size="sm" className="text-primary mb-0.5">Courier Pickup</Typography>
                 <Typography variant="body" size="sm" className="text-primary/50">We'll handle the logistics from your doorstep.</Typography>
                 <Typography variant="label" size="sm" className="text-[10px] text-primary mt-2 lowercase">Complimentary for Gold Curators</Typography>
              </View>
              <ArrowRight size={18} color={COLORS.primary} opacity={0.3} />
           </TouchableOpacity>
        </View>

        {/* EDUCATIONAL FOOTER */}
        <View className="mt-12 bg-cream/20 p-6 rounded-2xl flex-row items-start">
           <Info size={18} color={COLORS.primary} className="mt-0.5" />
           <View className="flex-1 ml-4">
              <Typography variant="headline" size="sm" className="text-primary mb-1">Why We Reclaim</Typography>
              <Typography variant="body" size="sm" className="text-primary/60 leading-relaxed">
                By recycling cast iron and steel from legacy cookware, we reduce the environmental impact of ore extraction and preserve material for the next generation of W-S artifacts.
              </Typography>
           </View>
        </View>
        
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};
