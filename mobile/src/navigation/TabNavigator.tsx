import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Gift, User, ShieldCheck } from 'lucide-react-native';
import { Platform } from 'react-native';
import { COLORS } from '../styles/theme';

// Screens
import { 
  HomeScreen, 
  RewardsScreen, 
  ProfileScreen, 
  HowItWorksScreen 
} from '../screens';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
          bottom: 0,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.primary_muted,
        tabBarLabelStyle: {
          fontFamily: 'Manrope_500Medium',
          fontSize: 10,
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen 
        name="Rewards" 
        component={RewardsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Gift size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen 
        name="Journey" 
        component={HowItWorksScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <ShieldCheck size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={2} />,
        }}
      />
    </Tab.Navigator>
  );
};
