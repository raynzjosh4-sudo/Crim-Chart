import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { dbService } from '@/core/db/database';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { chartToastConfig } from '@/components/showcase/CrimChart_toast';
import { useProtectedRoute } from '@/core/router/useProtectedRoute';
import { LocalizationProvider } from '@/core/localization/LocalizationProvider';

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#0D0D0D',
    text: '#FFFFFF',
    border: '#2A2A2A',
  },
};

export default function RootLayout() {
  useProtectedRoute();

  useEffect(() => {
    dbService.init().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#000' }}>
      <LocalizationProvider>
        <ThemeProvider value={customDarkTheme}>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="landing" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
          </Stack>
          <Toast config={chartToastConfig} />
        </ThemeProvider>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
}
