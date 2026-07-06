import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { AddStatusCard } from './AddStatusCard';
import { StatusCard } from './StatusCard';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { ChannelRestrictionWrapper } from '@/components/wrappers/ChannelRestrictionWrapper';
import { SeeAllStatusCard } from './SeeAllStatusCard';
import { useRouter } from 'expo-router';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';

// Dummy interface for a status item
export interface StatusItem {
  id: string;
  user: CrimChartUserModel;
  thumbnailUrl: string | null;
  hasUnseen: boolean;
  statuses?: any[];
}
export interface UserStatusWidgetProps {
  currentUser?: CrimChartUserModel | null;
  statuses?: StatusItem[];
  onAddStatusPress?: () => void;
  onStatusPress?: (status: StatusItem) => void;
  channelId?: string; // Optional: If provided, will enforce channel status posting restrictions
  onEndReached?: () => void;
}
export const UserStatusWidget: React.FC<UserStatusWidgetProps> = ({
  currentUser,
  statuses = [],
  onAddStatusPress,
  onStatusPress,
  channelId,
  onEndReached
}) => {
  const styles = useStyles(colors => ({
    container: {
      paddingVertical: 12
    },
    headerTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
      paddingHorizontal: 16
    },
    listContent: {
      paddingHorizontal: 16
    },
    itemContainer: {
      width: 86,
      height: 130,
      marginRight: 12
    }
  }));
  const router = useRouter();
  const {
    startLoading,
    stopLoading
  } = useGlobalProgress();
  const maxStatuses = 14;
  const statusesToShow = statuses.slice(0, maxStatuses);
  const hasMore = statuses.length > maxStatuses;
  const remainingCount = statuses.length - maxStatuses;
  const navigateToStatuses = async () => {
    startLoading();
    // Smooth transition
    await new Promise(resolve => setTimeout(resolve, 300));
    router.push('/statuses' as any);
    // Note: stopLoading() will be called by the statuses page itself once it's ready.
  };
  return <View style={styles.container}>
      <FlatList horizontal showsHorizontalScrollIndicator={false} data={statusesToShow} contentContainerStyle={styles.listContent} keyExtractor={item => item.id} onEndReached={onEndReached} onEndReachedThreshold={0.5} ListHeaderComponent={<View style={styles.itemContainer}>
            {channelId ? <ChannelRestrictionWrapper channelId={channelId} requiredAction="post_moment" fallback={null}>
                <AddStatusCard avatarUrl={currentUser?.profileImageUrl} onPress={onAddStatusPress} />
              </ChannelRestrictionWrapper> : <AddStatusCard avatarUrl={currentUser?.profileImageUrl} onPress={onAddStatusPress} />}
          </View>} renderItem={({
      item
    }) => <View style={styles.itemContainer}>
            <StatusCard username={item.user.displayName || item.user.username || 'Unknown'} avatarUrl={item.user.profileImageUrl} statusImageUrl={item.thumbnailUrl} hasUnseen={item.hasUnseen} statusCount={item.statuses?.length || 1} onPress={() => onStatusPress?.(item)} />
          </View>} ListFooterComponent={hasMore ? <View style={styles.itemContainer}>
              <SeeAllStatusCard onPress={navigateToStatuses} count={remainingCount} />
            </View> : null} />
    </View>;
};