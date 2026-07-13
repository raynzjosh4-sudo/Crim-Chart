import AppAvatar from '@/components/avatar/AppAvatar';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useStyles } from '@/core/hooks/useStyles';
import { useTranslation } from '@/core/localization/i18n';
import { BlockedUser, useBlockUser } from '@/features/profile/hooks/useBlockUser';
import { useNetInfo } from '@react-native-community/netinfo';

import { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function BlockedUsersSettingsPage() {
  const { t } = useTranslation();
  const netInfo = useNetInfo();
  const isOnline = netInfo.isConnected && netInfo.isInternetReachable !== false;
  const { fetchBlockedUsers, unblockUser } = useBlockUser();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      padding: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarContainer: {
      marginRight: 12,
    },
    infoContainer: {
      flex: 1,
    },
    username: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    unblockBtn: {
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    unblockTxt: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 100,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    offlineNotice: {
      backgroundColor: colors.surface,
      padding: 12,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    offlineText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    shimmerRow: {
      opacity: 0.5,
    },
    shimmerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface,
    },
    shimmerTextLine: {
      width: '60%',
      height: 16,
      backgroundColor: colors.surface,
      borderRadius: 4,
    }
  }));

  const loadUsers = async () => {
    setIsRefreshing(true);
    const users = await fetchBlockedUsers();
    setBlockedUsers(users);
    setIsRefreshing(false);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUnblock = async (targetId: string) => {
    const success = await unblockUser(targetId);
    if (success) {
      setBlockedUsers(blockedUsers.filter(u => u.blocked_id !== targetId));
    }
  };

  const renderItem = ({ item }: { item: BlockedUser }) => (
    <View style={styles.row}>
      <View style={styles.avatarContainer}>
        <AppAvatar
          url={item.blocked_avatar_url || ''}
          size={48}
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.username}>
          {item.blocked_username || 'Unknown User'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.unblockBtn}
        onPress={() => handleUnblock(item.blocked_id)}
        activeOpacity={0.8}
      >
        <Text style={styles.unblockTxt}>{t('unblock' as any, { defaultValue: 'Unblock' })}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title={t('blocked' as any, { defaultValue: 'Blocked' })} showBack />

      {!isOnline && (
        <View style={styles.offlineNotice}>
          <Text style={styles.offlineText}>
            {t('offline_showing_cached' as any, { defaultValue: "You're offline. Showing locally saved blocked users." })}
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={{ padding: 16 }}>
          {[1, 2, 3, 4, 5].map((key) => (
            <View key={key} style={[styles.row, styles.shimmerRow]}>
              <View style={[styles.avatarContainer, styles.shimmerAvatar]} />
              <View style={styles.infoContainer}>
                <View style={styles.shimmerTextLine} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={loadUsers}
          refreshing={isRefreshing}
          keyExtractor={item => item.blocked_id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t('no_blocked_users' as any) === 'no_blocked_users' ? 'No blocked users' : (t('no_blocked_users' as any) as any)}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
