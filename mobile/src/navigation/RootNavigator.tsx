import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { VerificationNavigator } from './VerificationNavigator';
import { RecycleProductScreen, ActionConfirmationScreen } from '../screens';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_bottom' }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      
      {/* 
        The Verification flow is a dedicated stack that overlays 
        the bottom tabs for a focused experience.
      */}
      <Stack.Screen name="VerifyFlow" component={VerificationNavigator} />
      
      {/* 
        Standalone transactional screens 
      */}
      <Stack.Screen name="Recycle" component={RecycleProductScreen} />
      <Stack.Screen name="Confirmation" component={ActionConfirmationScreen} />
    </Stack.Navigator>
  );
};
