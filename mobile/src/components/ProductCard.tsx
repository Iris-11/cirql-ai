import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Typography, Button } from './ui';
import { Leaf, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../styles/theme';

interface ProductCardProps {
  name: string;
  brand?: string;
  status?: string;
  sustainabilityScore: number;
  image: string;
  onPress?: () => void;
  variant?: 'editorial' | 'portfolio' | 'rehome';
}

export const ProductCard = ({ 
  name, 
  brand, 
  status, 
  sustainabilityScore, 
  image, 
  onPress,
  variant = 'editorial'
}: ProductCardProps) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress}
      className="bg-white rounded-2xl overflow-hidden mb-6 shadow-premium"
    >
      <View className="relative h-64 w-full bg-cream/30">
        <Image 
          source={{ uri: image }} 
          className="h-full w-full object-cover" 
          resizeMode="cover"
        />
        <View className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full flex-row items-center">
          <Leaf size={12} color={COLORS.primary} fill={COLORS.primary} />
          <Typography variant="label" size="sm" className="ml-1 text-primary">
            {sustainabilityScore}
          </Typography>
        </View>
        
        {status && (
          <View className="absolute top-4 left-4 bg-primary/90 px-3 py-1 rounded-full">
            <Typography variant="label" size="sm" className="text-white text-[10px]">
              {status}
            </Typography>
          </View>
        )}
      </View>
      
      <View className="p-5 flex-row items-center justify-between">
        <View className="flex-1">
          {brand && (
            <Typography variant="label" size="sm" className="text-primary/60 mb-1">
              {brand}
            </Typography>
          )}
          <Typography variant="headline" size="md" numberOfLines={1}>
            {name}
          </Typography>
        </View>
        
        <View className="ml-4">
          <ChevronRight size={20} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};
