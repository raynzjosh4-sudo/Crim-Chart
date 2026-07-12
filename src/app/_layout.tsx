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
import { useFonts } from 'expo-font';
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

import { Text, TextInput } from 'react-native';

// Apply global font family
const customTextProps = {
  style: {
    fontFamily: 'ComicRelief-Regular'
  }
};
if ((Text as any).defaultProps == null) {
  (Text as any).defaultProps = {};
}
(Text as any).defaultProps.style = [
  (Text as any).defaultProps.style,
  customTextProps.style
];

if ((TextInput as any).defaultProps == null) {
  (TextInput as any).defaultProps = {};
}
(TextInput as any).defaultProps.style = [
  (TextInput as any).defaultProps.style,
  customTextProps.style
];

import { ExploreChannelsPage } from '@/channel/pages/ExploreChannelsPage';
import { useExploreStore } from '@/channel/store/useExploreStore';
import { DesktopChannelModal } from '@/channel/widgets/DesktopChannelModal';
import { ProgressProvider } from '@/components/globalProgressBar/GlobalProgressBar';
import { OfflineStaleDataBanner, SlowConnectionBanner } from '@/components/offlineIndicators';
import { useAppPresence } from '@/core/hooks/useAppPresence';
import { usePresenceSyncWorker } from '@/core/sync/usePresenceSyncWorker';
import { Modal } from 'react-native';

const GlobalExploreModal = () => {
  const isOpen = useExploreStore(s => s.isOpen);
  const closeExplore = useExploreStore(s => s.closeExplore);

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={closeExplore}>
      <ExploreChannelsPage isModal={true} />
    </Modal>
  );
};

const injectWebScrollbarStyle = () => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    if (document.getElementById('custom-scrollbar-style')) return;
    const style = document.createElement('style');
    style.id = 'custom-scrollbar-style';
    style.textContent = `
      /* 1. Reset margins and force black background on all root layers */
      html, body, #root, #__next {
        width: 100%;
        height: 100%;
        margin: 0 !important;
        padding: 0 !important;
        background-color: #000000 !important;
        overflow: hidden !important; 
        color-scheme: dark !important;
      }

      /* 2. Target EVERY element to hide inner ScrollView/FlatList scrollbars */
      *::-webkit-scrollbar {
        display: none !important;
        width: 0px !important;
        height: 0px !important;
        background: transparent !important;
        -webkit-appearance: none !important;
      }
      
      *::-webkit-scrollbar-track {
        background: transparent !important;
        border: none !important;
      }

      *::-webkit-scrollbar-thumb {
        background: transparent !important;
        border: none !important;
      }

      /* 3. Firefox universal hide */
      * {
        scrollbar-width: none !important;
      }
    `;
    document.head.appendChild(style);

    // Force inline styles on root elements to guarantee no native window scrolling
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.backgroundColor = '#000000';
    
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#000000';
    
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.style.overflow = 'hidden';
      rootEl.style.backgroundColor = '#000000';
    }
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
  const [fontsLoaded] = useFonts({
    'ComicRelief-Regular': require('@/assets/fonts/Comic_Relief/ComicRelief-Regular.ttf'),
    'ComicRelief-Bold': require('@/assets/fonts/Comic_Relief/ComicRelief-Bold.ttf'),
  });

  useProtectedRoute();
  useAppPresence();
  usePresenceSyncWorker();

  useEffect(() => {
    injectWebScrollbarStyle();
    dbService.init().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#000' }}>
      <LocalizationProvider>
        <AppThemeProvider>
          <NavThemeProvider value={customDarkTheme}>
            <ProgressProvider>
              <AnimatedSplashOverlay />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="welcome" options={{ headerShown: false, animation: 'slide_from_right' }} />
                <Stack.Screen name="landing" options={{ headerShown: false, animation: 'slide_from_right' }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="recover" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="add-post" options={{ presentation: 'transparentModal', animation: 'fade' }} />
              </Stack>
              <OfflineStaleDataBanner />
              <SlowConnectionBanner />
              <GlobalExploreModal />
              <DesktopChannelModal />
              <Toast config={{ ...chartToastConfig, ...toastConfig }} />
            </ProgressProvider>
          </NavThemeProvider>
        </AppThemeProvider>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
}
