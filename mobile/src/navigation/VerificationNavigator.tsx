import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  VerifyProductScreen, 
  VerificationPendingScreen, 
  VerificationResultScreen 
} from '../screens';

const Stack = createNativeStackNavigator();

export const VerificationNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Capture" component={VerifyProductScreen} />
      <Stack.Screen name="Pending" component={VerificationPendingScreen} />
      <Stack.Screen name="Result" component={VerificationResultScreen} />
    </Stack.Navigator>
  );
};
