import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { View, useWindowDimensions, Platform, StyleSheet, Text } from 'react-native';
import { AppSideNavBar } from '@/components/navbar/AppSideNavBar';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import SettingsPage from '@/features/settings/pages/SettingsPage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDesktopComposeStore } from '@/core/store/useDesktopComposeStore';
import { PostType } from '@/core/store/usePostingStore';

export default function SettingsLayout() {
  const { width } = useWindowDimensions();
  const theme = useCurrentTheme();
  const colors = theme.colors;
  const router = useRouter();
  
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const onItemTapped = (index: number) => {
    try {
      switch (index) {
        case 0: router.navigate('/'); break;
        case 1: router.navigate('/vids'); break;
        case 2: 
          if (Platform.OS === 'web') {
            useDesktopComposeStore.getState().openModal();
          } else {
            router.navigate('/first-post');
          }
          break;
        case 3: router.navigate('/channels'); break;
        case 4: router.navigate('/statuses' as any); break;
        case 5: router.navigate('/inbox'); break;
        default: break;
      }
    } catch (e) {}
  };

  if (isDesktop) {
    return (
      <View style={[styles.desktopContainer, { backgroundColor: colors.background }]}>
        {/* Left Nav */}
        <AppSideNavBar selectedIndex={-1} onItemTapped={onItemTapped} />
        
        {/* Middle Settings Menu */}
        <View style={[styles.middlePane, { borderRightColor: colors.surfaceVariant }]}>
          <SettingsPage isSplitPane />
        </View>

        {/* Right Settings Content */}
        <View style={styles.rightPane}>
          <Slot />
        </View>
      </View>
    );
  }

  // On Mobile, just use a normal stack
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  middlePane: {
    width: 400,
    borderRightWidth: 1,
  },
  rightPane: {
    flex: 1,
  }
});
