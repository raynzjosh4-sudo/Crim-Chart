import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { ChartChannelListItem } from '../widgets/charters/ChartChannelListItem';
import { SkeletonChannelListItem } from '../widgets/charters/SkeletonChannelListItem';
import { CreateChannelButton } from '../widgets/charters/CreateChannelButton';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';

interface ChannelsProfileTabProps {
  channels?: CrimChartUserModel[];
  isLoading?: boolean;
  isCurrentUser?: boolean;
  onChannelPress?: (channel: CrimChartUserModel) => void;
  onCreateChannel?: () => void;
}

export const ChannelsProfileTab: React.FC<ChannelsProfileTabProps> = ({
  channels = [],
  isLoading = false,
  isCurrentUser = false,
  onChannelPress,
  onCreateChannel,
}) => {
  if (isLoading) {
    return (
      <View style={{ marginTop: 8 }}>
        <SkeletonChannelListItem count={5} />
      </View>
    );
  }

  return (
    <FlatList
      data={channels}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        isCurrentUser && onCreateChannel ? (
          <View style={styles.createBtnWrapper}>
            <CreateChannelButton onPress={onCreateChannel} />
          </View>
        ) : null
      }
      renderItem={({ item, index }) => (
        <ChartChannelListItem
          channel={item}
          position={index + 1}
          onPress={() => onChannelPress?.(item)}
        />
      )}
      contentContainerStyle={{ paddingVertical: 8 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  createBtnWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
