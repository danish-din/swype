import React, { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Toast from '@/components/Toast';
import { useAppStore } from '@/store/useAppStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

const RootLayout = () => {
  const init = useAppStore((state) => state.init);

  useEffect(() => {
    const bootstrap = async () => {
      await init();
      SplashScreen.hideAsync();
    };
    bootstrap().catch(() => SplashScreen.hideAsync());
  }, [init]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade'
          }}
        />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
