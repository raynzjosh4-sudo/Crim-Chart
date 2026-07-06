import { Buffer } from 'buffer';
import { TouchableOpacity } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { chartToastConfig } from '@/components/showcase/CrimChart_toast';
import { toastConfig } from '@/components/showcase/CrimChartToast';
import { dbService } from '@/core/db/database';
import { LocalizationProvider } from '@/core/localization/LocalizationProvider';
import { useProtectedRoute } from '@/core/router/useProtectedRoute';
import { ThemeProvider as AppThemeProvider } from '@/core/theme/theme_provider';
import { DarkTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// Import background messaging to register the headless JS task immediately
if (Platform.OS !== 'web') {
  require('@/core/notifications/useBackgroundMessaging');
}

if (typeof (globalThis as any).Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

// Global touch feedback fix
if (TouchableOpacity.defaultProps) {
  TouchableOpacity.defaultProps.activeOpacity = 1;
} else {
  (TouchableOpacity as any).defaultProps = { activeOpacity: 1 };
}

import { ProgressProvider } from '@/components/globalProgressBar/GlobalProgressBar';
import { OfflineStateWidget } from '@/components/offline/OfflineStateWidget';
import { useAppPresence } from '@/core/hooks/useAppPresence';
import { usePresenceSyncWorker } from '@/core/sync/usePresenceSyncWorker';

const injectWebScrollbarStyle = () => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    if (document.getElementById('custom-scrollbar-style')) return;
    const style = document.createElement('style');
    style.id = 'custom-scrollbar-style';
    style.textContent = `
      html, body {
        overflow-y: scroll;
      }
      /* Elegant dark mode scrollbar */
      ::-webkit-scrollbar {
        height: 6px;
        width: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.25);
      }
      * {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
      }
    `;
    document.head.appendChild(style);
  }
};

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
    injectWebScrollbarStyle();
    dbService.init().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#000' }}>
      <LocalizationProvider>
        <AppThemeProvider>
          <NavThemeProvider value={customDarkTheme}>
            <ProgressProvider>
              <AnimatedSplashOverlay />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="landing" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="recover" options={{ headerShown: false }} />
                <Stack.Screen name="add-post" options={{ presentation: 'transparentModal', animation: 'fade' }} />
              </Stack>
              <OfflineStateWidget />
              <Toast config={{ ...chartToastConfig, ...toastConfig }} />
            </ProgressProvider>
          </NavThemeProvider>
        </AppThemeProvider>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
}
