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
  thumbnailUrl: string;
  hasUnseen: boolean;
  statuses?: any[];
}

export interface UserStatusWidgetProps {
  currentUser?: CrimChartUserModel | null;
  statuses?: StatusItem[];
  onAddStatusPress?: () => void;
  onStatusPress?: (status: StatusItem) => void;
  channelId?: string; // Optional: If provided, will enforce channel status posting restrictions
}

export const UserStatusWidget: React.FC<UserStatusWidgetProps> = ({
  currentUser,
  statuses = [],
  onAddStatusPress,
  onStatusPress,
  channelId,
}) => {
  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={statuses}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          channelId ? (
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
          )
        }
        renderItem={({ item }) => (
          <StatusCard
            username={item.user.displayName || item.user.username || 'Unknown'}
            avatarUrl={item.user.profileImageUrl}
            statusImageUrl={item.thumbnailUrl}
            hasUnseen={item.hasUnseen}
            statusCount={item.statuses?.length || 1}
            onPress={() => onStatusPress?.(item)}
          />
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
});
