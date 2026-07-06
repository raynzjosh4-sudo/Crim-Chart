import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, RefreshControl, Platform, useWindowDimensions } from 'react-native';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { useNotificationStore } from '../application/useNotificationStore';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { NotificationTile } from '../components/NotificationTile';
import { AppNotification } from '../data/NotificationRepository';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';

export const NotificationsPage = () => {
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  const colors = theme.colors;
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const { user } = useAuthStore();
  const { stopLoading } = useGlobalProgress();
  const { notifications, isLoading, hasMore, fetchNotifications, markAsRead, subscribeToNotifications } = useNotificationStore();
  const [refreshing, setRefreshing] = useState(false);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    // Data is pre-fetched by useAppNavigation before routing here.
    // If we land here directly (e.g. web refresh), the global layout will fetch it.
  }, [user]);

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchNotifications(user.id, true);
    setRefreshing(false);
  };

  const handleEndReached = () => {
    if (!user || isLoading || !hasMore) return;
    fetchNotifications(user.id);
  };

  const handleNotificationPress = async (notification: AppNotification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on type and reference_id
    if (notification.reference_id) {
      if (notification.type === 'like' || notification.type === 'comment' || notification.type === 'post_tag' || notification.type === 'mention') {
        // We'd typically navigate to a post detail page here. For now, navigate to profile or home
        // router.push(`/post/${notification.reference_id}`);
      } else if (notification.type === 'channel_invite' || notification.type === 'channel_request') {
        router.push(`/channel/${notification.reference_id}` as any);
      } else if (notification.type === 'follow') {
        router.push(`/?viewProfile=${notification.actor_id}` as any);
      }
    }
  };

  const renderEmptyComponent = () => {
    if (isLoading && notifications.length === 0) return null; // Or a shimmer
    
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Bell size={48} color={colors.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>No notifications yet</Text>
        <Text style={styles.emptySubtitle}>When you get likes, comments, or followers, you'll see them here.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header (Mobile Only, Desktop usually has a shared header) */}
      {!isDesktop && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationTile notification={item} onPress={handleNotificationPress} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={notifications.length === 0 ? { flex: 1 } : undefined}
      />
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 48 * scale,
    paddingBottom: 16 * scale,
    paddingHorizontal: 20 * scale,
    borderBottomWidth: 0.5 * scale,
    borderBottomColor: colors.surfaceVariant,
    backgroundColor: 'rgba(0,0,0,0.5)', // Or theme background
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22 * scale,
    fontWeight: '800' as const,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 40 * scale,
    marginTop: 100 * scale,
  },
  emptyIconCircle: {
    width: 96 * scale,
    height: 96 * scale,
    borderRadius: 48 * scale,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 24 * scale,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 24 * scale,
    fontWeight: '800' as const,
    marginBottom: 12 * scale,
    textAlign: 'center' as const,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 15 * scale,
    textAlign: 'center' as const,
    lineHeight: 20 * scale,
  }
});
