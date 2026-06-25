import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';
import { TouchableOpacity } from 'react-native';

if (typeof (globalThis as any).Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

// Global touch feedback fix
if (TouchableOpacity.defaultProps) {
  TouchableOpacity.defaultProps.activeOpacity = 1;
} else {
  (TouchableOpacity as any).defaultProps = { activeOpacity: 1 };
}
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { dbService } from '@/core/db/database';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { chartToastConfig } from '@/components/showcase/CrimChart_toast';
import { toastConfig } from '@/components/showcase/CrimChartToast';
import { useProtectedRoute } from '@/core/router/useProtectedRoute';
import { LocalizationProvider } from '@/core/localization/LocalizationProvider';

import { useAppPresence } from '@/core/hooks/useAppPresence';
import { usePresenceSyncWorker } from '@/core/sync/usePresenceSyncWorker';

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#FFD700',
    background: '#000000',
    card: '#0D0D0D',
    text: '#FFFFFF',
    border: '#2A2A2A',
  },
};

export default function RootLayout() {
  useProtectedRoute();
  useAppPresence();
  usePresenceSyncWorker();

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
          <Toast config={{ ...chartToastConfig, ...toastConfig }} />
        </ThemeProvider>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
}
