import { AppBottomNavBar } from '@/components/navbar/AppBottomNavBar';
import { DraggableProfileButton } from '@/components/profile/DraggableProfileButton';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

import { useWindowDimensions } from 'react-native';
import { AppSideNavBar } from '@/components/navbar/AppSideNavBar';
import { DesktopRightSidebar } from '@/components/navbar/DesktopRightSidebar';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const { width } = useWindowDimensions();
  
  const isDesktop = width >= 768;

  const bottomPadding = Math.max(8, insets.bottom);
  const tabBarHeight = 60 + insets.bottom;

  const last = String(segments[segments.length - 1] ?? '');
  let selectedIndex = 0;
  if (last === 'index' || last === '') selectedIndex = 0;
  else if (last === 'vids' || last === 'explore') selectedIndex = 1;
  else if (last === 'channels') selectedIndex = 3;
  else if (last === 'statuses') selectedIndex = 4;
  else if (last === 'inbox') selectedIndex = 5;

  const onItemTapped = (index: number) => {
    console.log(`[TabsLayout] Tapped tab index: ${index}`);
    try {
      switch (index) {
        case 0:
          router.navigate('/');
          break;
        case 1:
          router.navigate('/vids');
          break;
        case 2:
          router.navigate('/first-post');
          break;
        case 3:
          router.navigate('/channels');
          break;
        case 4:
          console.log('[TabsLayout] Statuses clicked. Navigating to /statuses');
          // Add your statuses route here. For now it just logs or tries to push
          router.navigate('/statuses' as any);
          break;
        case 5:
          router.navigate('/inbox');
          break;
        case 6:
          console.log('[TabsLayout] Search clicked.');
          // router.navigate('/search');
          break;
        case 7:
          console.log('[TabsLayout] Notifications clicked.');
          // router.navigate('/notifications');
          break;
        default:
          break;
      }
    } catch (e) {
      console.error(`[TabsLayout] Navigation error:`, e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, flexDirection: isDesktop ? 'row' : 'column' }]}>
      {/* Desktop Side Navigation */}
      {isDesktop && (
        <AppSideNavBar selectedIndex={selectedIndex} onItemTapped={onItemTapped} />
      )}

      {/* Main Content Area */}
      <View style={{ flex: 1, maxWidth: isDesktop ? 600 : '100%', width: '100%', marginHorizontal: isDesktop ? 'auto' : undefined }}>
        <Slot />
      </View>

      {/* Desktop Right Navigation / Status Grid */}
      {isDesktop && <DesktopRightSidebar />}

      {/* Mobile Bottom Navigation */}
      {!isDesktop && (
        <View style={[styles.tabBar, { height: tabBarHeight, paddingBottom: bottomPadding, backgroundColor: theme.colors.background }]}>
          <AppBottomNavBar selectedIndex={selectedIndex} onItemTapped={onItemTapped} />
        </View>
      )}

      {/* Profile Button - Hidden on Desktop as it's in the Sidebar */}
      {!isDesktop && <DraggableProfileButton />}
    </View>
  );
}

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabarIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8 * scale,
    padding: 6 * scale,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tabbaricon2: {
    position: 'absolute' as const,
    right: -4 * scale,
    top: -6 * scale,
    backgroundColor: colors.error,
    borderRadius: 6 * scale,
    width: 12 * scale,
    height: 12 * scale,
    borderWidth: 2 * scale,
    borderColor: colors.background,
  },
  tabBar: {
    borderTopWidth: 0.5,
    borderTopColor: colors.surfaceVariant,
    backgroundColor: colors.background,
  },
});
