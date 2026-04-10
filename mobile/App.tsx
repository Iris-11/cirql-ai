import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useFonts, 
  Manrope_400Regular, 
  Manrope_500Medium, 
  Manrope_700Bold 
} from '@expo-google-fonts/manrope';
import { 
  NotoSerif_400Regular, 
  NotoSerif_500Medium, 
  NotoSerif_700Bold 
} from '@expo-google-fonts/noto-serif';
import * as SplashScreen from 'expo-splash-screen';

import { RootNavigator } from './src/navigation/RootNavigator';
import './src/styles/global.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
    NotoSerif_400Regular,
    NotoSerif_500Medium,
    NotoSerif_700Bold,
  });

  const onLayoutRootView = React.useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer onReady={onLayoutRootView}>
          <RootNavigator />
          <StatusBar style="dark" />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
