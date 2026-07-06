import UserAvatar from '@/components/avatar/UserAvatar';
import { useStyles } from '@/core/hooks/useStyles';
import { useDesktopComposeStore } from '@/core/store/useDesktopComposeStore';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useNotificationStore } from '@/features/notifications/application/useNotificationStore';
import { BadgeIcon } from '@/mainFeed/features/bottomappbar/iconwithbarge/BadgeIcon';
import { useRouter, usePathname, useGlobalSearchParams } from 'expo-router';
import { Bell, CircleDashed, Clapperboard, Compass, Feather, Home, MessageSquare, Music, Search, Settings, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, useWindowDimensions, View, Image } from 'react-native';

export interface AppSideNavBarProps {
  selectedIndex: number;
  onItemTapped: (index: number) => void;
  homeBadgeCount?: number;
}

export const AppSideNavBar = ({ selectedIndex, onItemTapped, homeBadgeCount = 0 }: AppSideNavBarProps) => {
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  const colors = theme.colors;
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const { id } = useGlobalSearchParams();

  // X style breakpoints:
  // > 1280px = Full sidebar (275px wide)
  // 768px - 1280px = Icon-only sidebar (88px wide)
  const isExpanded = width >= 1280;

  const { user } = useAuthStore();
  const unreadCount = useNotificationStore(s => s.unreadCount);

  return (
    <View style={[styles.container, { width: isExpanded ? 275 : 88, backgroundColor: colors.background, borderRightColor: colors.surfaceVariant }]}>

      {/* Top Logo / Branding */}
      <View style={styles.logoContainer}>
        <TouchableOpacity style={styles.logoButton} activeOpacity={0.7} onPress={() => router.navigate('/')}>
          <Image source={require('@/assets/appicon/appicon.png')} style={{ width: 48, height: 48 }} resizeMode="contain" />
          {isExpanded && (
            <Text style={[styles.logoText, { color: colors.primary }]}>
              Crimchart
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Navigation Items */}
      <ScrollView style={styles.navItemsContainer} showsVerticalScrollIndicator={false}>
        <NavItem
          index={0}
          selectedIndex={selectedIndex}
          onTap={onItemTapped}
          icon={<BadgeIcon IconComponent={Home} count={Boolean(homeBadgeCount) ? 1 : 0} />}
          selectedIcon={<BadgeIcon IconComponent={Home} count={Boolean(homeBadgeCount) ? 1 : 0} />}
          label="Crim"
          isExpanded={isExpanded}
        />
        <NavItem
          index={6}
          selectedIndex={selectedIndex}
          onTap={onItemTapped}
          icon={<Search size={28} />}
          selectedIcon={<Search size={28} fill={colors.text} />}
          label="Search"
          isExpanded={isExpanded}
        />
        <NavItem
          index={7}
          selectedIndex={selectedIndex}
          onTap={onItemTapped}
          icon={<BadgeIcon IconComponent={Bell} count={unreadCount} />}
          selectedIcon={<BadgeIcon IconComponent={Bell} count={unreadCount} />}
          label="Notifications"
          isExpanded={isExpanded}
        />
        <NavItem
          index={1}
          selectedIndex={selectedIndex}
          onTap={onItemTapped}
          icon={<Clapperboard size={28} />}
          selectedIcon={<Clapperboard size={28} fill={colors.text} />}
          label="Vids"
          isExpanded={isExpanded}
        />
        <NavItem
          index={8}
          selectedIndex={selectedIndex}
          onTap={onItemTapped}
          icon={<Music size={28} />}
          selectedIcon={<Music size={28} fill={colors.text} />}
          label="My Music"
          isExpanded={isExpanded}
        />
        <NavItem
          index={3}
          selectedIndex={selectedIndex}
          onTap={onItemTapped}
          icon={<BadgeIcon IconComponent={Compass} showDot={true} />}
          selectedIcon={<BadgeIcon IconComponent={Compass} showDot={true} />}
          label="Channels"
          isExpanded={isExpanded}
        />
        <NavItem
          index={4}
          selectedIndex={selectedIndex}
          onTap={onItemTapped}
          icon={<CircleDashed size={28} />}
          selectedIcon={<CircleDashed size={28} fill={colors.text} />}
          label="Statuses"
          isExpanded={isExpanded}
        />
        <NavItem
          index={5}
          selectedIndex={selectedIndex}
          onTap={onItemTapped}
          icon={<MessageSquare size={28} />}
          selectedIcon={<MessageSquare size={28} fill={colors.text} />}
          label="Chat"
          isExpanded={isExpanded}
        />
        <NavItem
          index={-1}
          selectedIndex={selectedIndex}
          onTap={() => router.push('/settings')}
          icon={<Settings size={28} />}
          selectedIcon={<Settings size={28} fill={colors.text} />}
          label="Settings"
          isExpanded={isExpanded}
        />
      </ScrollView>

      {/* Global Post Button */}
      <TouchableOpacity
        style={[styles.postButton, {
          width: isExpanded ? '80%' : 50,
          height: isExpanded ? 50 : 50,
          borderRadius: 25,
          backgroundColor: colors.primary
        }]}
        activeOpacity={0.8}
        onPress={() => {
          if (pathname.includes('/channel/channelpage') && id) {
            useDesktopComposeStore.getState().openModal({
              targetChannelId: id as string,
              postType: 'channel_post',
            });
          } else {
            useDesktopComposeStore.getState().openModal();
          }
        }}
      >
        {isExpanded ? (
          <Text style={styles.postButtonText}>Post</Text>
        ) : (
          <Feather size={24} color="#000" />
        )}
      </TouchableOpacity>

      {/* Bottom Profile Button */}
      {user && (
        <View style={styles.profileContainer}>
          <TouchableOpacity
            style={[styles.profileButton, !isExpanded && { justifyContent: 'center', paddingHorizontal: 0 }]}
            activeOpacity={0.8}
            onPress={() => router.navigate('/profile')}
          >
            <UserAvatar userId={user.id} fallbackUrl={user.profileImageUrl} name={user.displayName} size={40} />
            {isExpanded && (
              <View style={styles.profileTextContainer}>
                <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>{user.displayName}</Text>
                <Text style={[styles.profileHandle, { color: colors.textSecondary }]} numberOfLines={1}>@{user.username}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const NavItem = ({
  index,
  selectedIndex,
  onTap,
  icon,
  selectedIcon,
  label,
  isExpanded,
}: any) => {
  const isSelected = index === selectedIndex;
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  const colors = theme.colors;

  const itemColor = isSelected ? colors.text : colors.text; // X uses text color for both, boldness changes

  const [isHovered, setIsHovered] = useState(false);

  return (
    <View style={[styles.navItemWrapper, { alignItems: isExpanded ? 'flex-start' : 'center' }]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onTap(index)}
        // @ts-ignore - Web only hover props
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={[
          styles.navItem,
          {
            backgroundColor: isHovered ? (Platform.OS === 'web' ? 'rgba(255,255,255,0.1)' : 'transparent') : 'transparent',
            paddingHorizontal: isExpanded ? 20 : 12,
          }
        ]}
      >
        <View style={styles.iconContainer}>
          {(() => {
            const element = isSelected ? selectedIcon : icon;
            if (!element) return null;
            const Component: any = (element as any).type;
            const existingProps = (element as any).props || {};
            // If it's a lucide icon it uses color, else we just pass it down
            return <Component {...existingProps} color={itemColor} strokeWidth={isSelected ? 3 : 2} />;
          })()}
        </View>

        {isExpanded && (
          <Text style={[styles.label, { color: itemColor, fontWeight: isSelected ? '700' : '400' }]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  container: {
    height: '100%',
    borderRightWidth: 0.5 * scale,
    paddingVertical: 0,
    paddingTop: 12 * scale,
    justifyContent: 'space-between' as const,
  },
  logoContainer: {
    paddingHorizontal: 12 * scale,
    paddingTop: 0,
    paddingBottom: 8 * scale,
    alignItems: 'flex-start' as const,
  },
  logoButton: {
    padding: 0,
    borderRadius: 999,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  logoText: {
    fontSize: 22 * scale,
    fontWeight: '800' as const,
    marginLeft: 12 * scale,
    letterSpacing: -0.5,
  },
  navItemsContainer: {
    flex: 1,
    marginTop: 8 * scale,
  },
  navItemWrapper: {
    width: '100%',
    marginBottom: 4 * scale,
  },
  navItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 12 * scale,
    borderRadius: 999,
    marginHorizontal: 8 * scale,
  },
  iconContainer: {
    width: 28 * scale,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  label: {
    fontSize: 20 * scale,
    marginLeft: 20 * scale,
    marginRight: 16 * scale,
  },
  postButton: {
    marginTop: 16 * scale,
    alignSelf: 'center' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  postButtonText: {
    color: colors.background, // Used to be colors.text, but we want it to contrast with the primary background color.
    fontSize: 17 * scale,
    fontWeight: '700' as const,
  },
  profileContainer: {
    paddingHorizontal: 12 * scale,
    paddingBottom: 16 * scale,
  },
  profileButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12 * scale,
    borderRadius: 999,
    backgroundColor: 'transparent',
    // hover effect can be added here
  },
  profileTextContainer: {
    marginLeft: 12 * scale,
    flex: 1,
    justifyContent: 'center' as const,
  },
  profileName: {
    fontSize: 15 * scale,
    fontWeight: '700' as const,
  },
  profileHandle: {
    fontSize: 15 * scale,
    marginTop: 2 * scale,
  },
});
