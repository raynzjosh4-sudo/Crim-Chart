import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { SkeletonChartCard } from '@/profile/widgets/SkeletonChartCard';
import {
  FlatList, RefreshControl, StyleSheet,
  Text, TouchableOpacity,
  View,
} from 'react-native';
import { ChannelsWidget } from '../../features/charts_stars/ChannelsWidget';
import { Mainfeedcard } from '../../features/mainfeedcard/subfeedCards/Mainfeedcard';
import { ChannelPostModel } from '../../models/ChannelPostModel';
import { MainFeedCardModel, MainFeedCardType } from '../../models/MainFeedCardTypeModel';
import { MainFeedCard } from '../../features/mainfeedcard/MainFeedCard';
import { DiscoverChannelWidget } from '@/channel/ChannelComponents/DiscoverChannelCard/discoverchannelWidget/DiscoverChannelWidget';

interface MainFeedBodyProps {
  cards: MainFeedCardModel[];
  discoveredChannels: CrimChartUserModel[];
  isLoading: boolean;
  isRefreshing: boolean;
  newItemCount?: number;
  onRefresh: () => void;
  onLoadMore: () => void;
  onNewItemsBannerPress?: () => void;
}

export const MainFeedBody = ({
  cards,
  discoveredChannels,
  isLoading,
  isRefreshing,
  newItemCount = 0,
  onRefresh,
  onLoadMore,
  onNewItemsBannerPress,
}: MainFeedBodyProps) => {
  const renderCard = ({ item, index }: { item: MainFeedCardModel; index: number }) => {
    // Inject exactly one channel widget every 15 posts
    const isChannelSlot = index > 0 && (index + 1) % 15 === 0;
    const channelIndex = Math.floor(index / 15);
    const channelToShow = isChannelSlot && discoveredChannels.length > 0
      ? discoveredChannels[channelIndex % discoveredChannels.length]
      : null;

    return (
      <View>
        <MainFeedCard card={item} />
        {channelToShow && (
          <View style={{ marginVertical: 24, alignItems: 'center' }}>
            <DiscoverChannelWidget
              userId={channelToShow.id}
              channelCount={0}
            />
          </View>
        )}
      </View>
    );
  };

  // Removed renderHeader to instead inject channels within the feed

  if (isLoading && cards.length === 0) {
    return (
      <View style={styles.skeletons}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonChartCard key={i} height={300} />
        ))}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {newItemCount > 0 && (
        <TouchableOpacity style={styles.newBanner} onPress={onNewItemsBannerPress}>
          <Text style={styles.newBannerText}>↑ {newItemCount} new posts</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={cards}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#FACD11"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletons: { gap: 12, padding: 12 },
  newBanner: {
    backgroundColor: '#FACD11',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginVertical: 8,
    shadowColor: '#FACD11',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  newBannerText: { color: '#000', fontWeight: '900', fontSize: 13 },
});
