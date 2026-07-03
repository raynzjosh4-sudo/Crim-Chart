import { AppBottomNavBar } from '@/components/navbar/AppBottomNavBar';
import { DraggableProfileButton } from '@/components/profile/DraggableProfileButton';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { Slot, useGlobalSearchParams, useRouter, useSegments } from 'expo-router';
import { Platform, Text, View, DeviceEventEmitter } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesktopChannelNavigator } from '@/channel/widgets/DesktopChannelNavigator';
import { UniversalComposeModal } from '@/components/compose/UniversalComposeModal';
import { AppSideNavBar } from '@/components/navbar/AppSideNavBar';
import { DesktopRightSidebar } from '@/components/navbar/DesktopRightSidebar';
import { DesktopVidsRightSidebar } from '@/components/navbar/DesktopVidsRightSidebar';
import { DesktopBoxDetailPane } from '@/components/navbar/DesktopBoxDetailPane';
import { useDesktopBoxStore } from '@/features/boxes/application/useDesktopBoxStore';
import CreateChannelPage from '@/app/channel/create';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { NativeDB } from '@/core/db/NativeDB';
import { useAppNavigation } from '@/core/navigation/useAppNavigation';
import { useDesktopComposeStore } from '@/core/store/useDesktopComposeStore';
import { setPreloadedMainFeed } from '@/mainFeed/pages/MainFeedPage';
import { InboxDetailPage } from '@/features/messaging/pages/InboxDetailPage';
import { DesktopVidsFeedPane } from '@/mainFeed/pages/main_page_widgets/DesktopVidsFeedPane';
import { MessageSquare } from 'lucide-react-native';
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const { width } = useWindowDimensions();
  const { startLoading, stopLoading } = useGlobalProgress();

  const isDesktop = width >= 768;

  // Global desktop box store
  const { activeBoxId } = useDesktopBoxStore();

  // On desktop, 'vids' is shown inline in the feed column instead of navigating
  const [desktopView, setDesktopView] = useState<'feed' | 'vids'>('feed');

  const bottomPadding = Math.max(8, insets.bottom);
  const tabBarHeight = 60 + insets.bottom;
  const { threadId, desktopChannelId } = useGlobalSearchParams<{ threadId?: string, desktopChannelId?: string }>();

  // Derive selectedIndex — on desktop, when vids is shown inline keep index=1 for nav highlight
  const last = String(segments[segments.length - 1] ?? '');
  let selectedIndex = 0;
  if (last === 'index' || last === '') selectedIndex = 0;
  else if (last === 'vids' || last === 'explore') selectedIndex = 1;
  else if (last === 'my-music') selectedIndex = 8;
  else if (last === 'channels') selectedIndex = 3;
  else if (last === 'statuses') selectedIndex = 4;
  else if (last === 'inbox') selectedIndex = 5;
  // When desktop inline vids view is active, highlight Vids in sidebar
  if (isDesktop && desktopView === 'vids') selectedIndex = 1;

  const { 
    navigateToCrim, 
    navigateToVids, 
    navigateToChannels, 
    navigateToCompose, 
    navigateToStatuses, 
    navigateToInbox, 
    navigateToMyMusic 
  } = useAppNavigation();

  const onItemTapped = async (index: number) => {
    console.log(`[TabsLayout] Tapped tab index: ${index}`);
    try {
      if (index === 0 && selectedIndex === 0) {
        DeviceEventEmitter.emit('tabRefresh', 'feed');
      }

      switch (index) {
        case 0:
          await navigateToCrim();
          if (isDesktop) setDesktopView('feed');
          break;
        case 1:
          if (isDesktop) {
            setDesktopView(desktopView === 'vids' ? 'feed' : 'vids');
          } else {
            await navigateToVids();
          }
          break;
        case 2:
          await navigateToCompose();
          break;
        case 3:
          if (isDesktop) setDesktopView('feed');
          await navigateToChannels();
          break;
        case 4:
          console.log('[TabsLayout] Statuses clicked.');
          if (isDesktop) setDesktopView('feed');
          await navigateToStatuses();
          break;
        case 5:
          if (isDesktop) setDesktopView('feed');
          await navigateToInbox();
          break;
        case 6:
          console.log('[TabsLayout] Search clicked.');
          break;
        case 7:
          console.log('[TabsLayout] Notifications clicked.');
          break;
        case 8:
          if (isDesktop) setDesktopView('feed');
          await navigateToMyMusic();
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
      <View style={{ flex: 1, maxWidth: isDesktop ? ((selectedIndex === 5 || selectedIndex === 3) ? '50%' : 600) : '100%', width: '100%', marginHorizontal: isDesktop && selectedIndex !== 5 && selectedIndex !== 3 ? 'auto' : undefined, borderRightWidth: isDesktop && (selectedIndex === 5 || selectedIndex === 3) ? 1 : 0, borderRightColor: theme.colors.surfaceVariant }}>
        {isDesktop && desktopView === 'vids' ? (
          <DesktopVidsFeedPane />
        ) : (
          <Slot />
        )}
      </View>

      {/* Desktop Right Navigation / Status Grid / Comments */}
      {isDesktop && selectedIndex !== 5 && selectedIndex !== 3 && (
        activeBoxId ? (
          <DesktopBoxDetailPane />
        ) : (desktopView === 'vids' || selectedIndex === 8) ? (
          <DesktopVidsRightSidebar />
        ) : (
          <DesktopRightSidebar />
        )
      )}

      {/* Desktop Channels Right Pane */}
      {isDesktop && selectedIndex === 3 && (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {desktopChannelId === 'create' ? (
            <CreateChannelPage isInline={true} />
          ) : desktopChannelId ? (
            <DesktopChannelNavigator channelId={desktopChannelId as string} />
          ) : (
            <DesktopRightSidebar />
          )}
        </View>
      )}

      {/* Desktop Inbox Right Pane */}
      {isDesktop && selectedIndex === 5 && (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {threadId ? (
            <InboxDetailPage />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                <MessageSquare size={40} color="#FFF" />
              </View>
              <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold' }}>Start Conversation</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, marginTop: 8 }}>Choose from your existing conversations, or start a new one.</Text>
            </View>
          )}
        </View>
      )}

      {/* Mobile Bottom Navigation */}
      {!isDesktop && (
        <View style={[
          styles.tabBar, 
          { 
            height: tabBarHeight, 
            paddingBottom: bottomPadding, 
            backgroundColor: theme.colors.background,
            borderTopWidth: selectedIndex === 1 ? 0 : 0.5 
          }
        ]}>
          <AppBottomNavBar selectedIndex={selectedIndex} onItemTapped={onItemTapped} hideBorder={selectedIndex === 1} />
        </View>
      )}

      {/* Profile Button - Hidden on Desktop as it's in the Sidebar */}
      {!isDesktop && <DraggableProfileButton />}

      {/* Universal Compose Modal for Web (Desktop & Mobile) */}
      {Platform.OS === 'web' && <UniversalComposeModal />}
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
