import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { AddStatusCard } from './AddStatusCard';
import { StatusCard } from './StatusCard';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { ChannelRestrictionWrapper } from '@/components/wrappers/ChannelRestrictionWrapper';

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
  onEndReached,
}) => {
  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={statuses}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View style={styles.itemContainer}>
            {channelId ? (
              <ChannelRestrictionWrapper channelId={channelId} requiredAction="post_moment" fallback={null}>
                <AddStatusCard 
                  avatarUrl={currentUser?.profileImageUrl} 
                  onPress={onAddStatusPress} 
                />
              </ChannelRestrictionWrapper>
            ) : (
              <AddStatusCard 
                avatarUrl={currentUser?.profileImageUrl} 
                onPress={onAddStatusPress} 
              />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <StatusCard
              username={item.user.displayName || item.user.username || 'Unknown'}
              avatarUrl={item.user.profileImageUrl}
              statusImageUrl={item.thumbnailUrl}
              hasUnseen={item.hasUnseen}
              statusCount={item.statuses?.length || 1}
              onPress={() => onStatusPress?.(item)}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    width: 86,
    height: 130,
    marginRight: 12,
  },
});
