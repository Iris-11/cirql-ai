import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from './ui';
import { User, Menu, ShoppingBag } from 'lucide-react-native';
import { COLORS } from '../styles/theme';

export const TopAppBar = () => {
  return (
    <View className="bg-background/80 border-b border-transparent">
      <SafeAreaView>
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity>
            <Menu size={24} color={COLORS.primary} strokeWidth={1.5} />
          </TouchableOpacity>
          
          <Typography variant="display" size="lg" className="text-primary tracking-widest uppercase">
            CIRQL
          </Typography>
          
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity className="mr-4">
              <ShoppingBag size={24} color={COLORS.primary} strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity>
              <User size={24} color={COLORS.primary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};
