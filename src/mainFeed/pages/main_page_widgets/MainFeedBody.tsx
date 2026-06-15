import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { MainFeedSkeletonCard } from './MainFeedSkeletonCard';
import { CompactPaginationSkeleton } from './CompactPaginationSkeleton';
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
import React, { useState, useRef } from 'react';
import { ShortVideosWidget } from './ShortVideosWidget';
import { MovieBoxFeedCard } from '@/features/boxes/components/feed/MovieBoxFeedCard';
import { MusicBoxFeedCard } from '@/features/boxes/components/feed/MusicBoxFeedCard';
import { SportsBoxFeedCard } from '@/features/boxes/components/feed/SportsBoxFeedCard';
import { StoreBoxFeedCard } from '@/features/boxes/components/feed/StoreBoxFeedCard';
import { VotingBoxFeedCard } from '@/features/boxes/components/feed/VotingBoxFeedCard';

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
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 80 },
      onViewableItemsChanged: ({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) {
          setActiveItemId(viewableItems[0].item.id);
        } else {
          setActiveItemId(null);
        }
      },
    },
  ]);

  const renderCard = ({ item, index }: { item: MainFeedCardModel; index: number }) => {
    // Inject exactly one channel widget every 10 posts
    const isChannelSlot = index > 0 && (index + 1) % 10 === 0;
    const channelIndex = Math.floor(index / 10);
    const channelToShow = isChannelSlot && discoveredChannels.length > 0
      ? discoveredChannels[channelIndex % discoveredChannels.length]
      : null;

    // Inject ShortVideosWidget every 10 posts
    const isShortsSlot = index > 0 && (index + 1) % 10 === 0;

    // Inject MainFeedBoxesWidget every 7 posts
    const isBoxesSlot = index > 0 && (index + 1) % 7 === 0 && !isChannelSlot && !isShortsSlot;
    const boxSlotIndex = Math.floor(index / 7) % 5;

    const renderBoxCard = () => {
      switch (boxSlotIndex) {
        case 0: return <MovieBoxFeedCard />;
        case 1: return <MusicBoxFeedCard />;
        case 2: return <SportsBoxFeedCard />;
        case 3: return <StoreBoxFeedCard />;
        case 4: return <VotingBoxFeedCard />;
        default: return <MovieBoxFeedCard />;
      }
    };

    return (
      <View>
        <MainFeedCard card={item} isActive={item.id === activeItemId} />
        {isShortsSlot && (
          <ShortVideosWidget />
        )}
        {isBoxesSlot && renderBoxCard()}
        {channelToShow && (
          <View style={{ marginVertical: 24, width: '100%' }}>
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
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <MainFeedSkeletonCard key={i} />
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
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
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
        ListFooterComponent={
          isLoading && cards.length > 0 ? (
            <CompactPaginationSkeleton />
          ) : null
        }
        showsVerticalScrollIndicator={false}
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
