import { DiscoverChannelWidget } from '@/channel/ChannelComponents/DiscoverChannelCard/discoverchannelWidget/DiscoverChannelWidget';
import { NoInternetFooter } from '@/components/internetcontionwidgets/NoInternetFooter';
import { StatusItem, UserStatusWidget } from '@/components/UserStatusWidget/UserStatusWidget';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { MovieBoxFeedCard } from '@/features/boxes/components/feed/MovieBoxFeedCard';
import { MusicBoxFeedCard } from '@/features/boxes/components/feed/MusicBoxFeedCard';
import { SportsBoxFeedCard } from '@/features/boxes/components/feed/SportsBoxFeedCard';
import { StoreBoxFeedCard } from '@/features/boxes/components/feed/StoreBoxFeedCard';
import { VotingBoxFeedCard } from '@/features/boxes/components/feed/VotingBoxFeedCard';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { FlashList } from '@shopify/flash-list';
import React, { useRef, useState } from 'react';
import {
  RefreshControl,
  Text, TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { MixedFeedItem } from '../../models/MixedFeedItem';
import { MainFeedSkeletonCard } from './MainFeedSkeletonCard';
import { SmartPostWidget } from './SmartPostWidget';
import { UserRecommendationCarousel } from './UserRecommendationCarousel';
import { VideoPostFeedCard } from './VideoPostFeedCard';

import { UserStatusViewer } from '@/components/status/UserStatusViewer';
import { useAppRouter } from '@/core/hooks/useAppRouter';
import { useStyles } from '@/core/hooks/useStyles';
import { useViewedStatusStore } from '@/core/store/useViewedStatusStore';
import { ThemeTokens } from '@/core/theme/themes';
import { useFeedStatuses } from '@/statuses/hooks/useFeedStatuses';
import * as ImagePicker from 'expo-image-picker';


const MemoizedFeedItem = React.memo(({
  item,
  isActive,
  discoveredChannels
}: {
  item: MixedFeedItem;
  isActive: boolean;
  discoveredChannels: any[];
}) => {
  if (item.entity_type.includes('box')) {
    // console.log('[FEED DEBUG] MemoizedFeedItem rendering box:', item.entity_type, '| prefetchedData.id:', item.prefetchedData?.id ?? 'MISSING');
  }
  if (item.entity_type.includes('carousel')) {
    console.log('[MainFeedPage] FlashList is actively trying to render the carousel:', item.entity_type);
  }
  switch (item.entity_type) {
    case 'long_video_post':
      return <VideoPostFeedCard postId={item.entity_id} isActive={isActive} entityType="long_video_post" sourceType={item.source_type} prefetchedData={item.prefetchedData} />;
    case 'short_video_post':
      return <VideoPostFeedCard postId={item.entity_id} isActive={isActive} entityType="short_video_post" sourceType={item.source_type} prefetchedData={item.prefetchedData} />;
    case 'audio_post':
    case 'image_post':
    case 'standard_post':
    case 'channel_post':
    case 'post':
      return <SmartPostWidget postId={item.entity_id} entityType={item.entity_type} sourceType={item.source_type} isActive={isActive} prefetchedData={item.prefetchedData} />;
    case 'box':
    case 'box_store':
    case 'box_marketplace':
      return <StoreBoxFeedCard boxId={item.entity_id} prefetchedData={item.prefetchedData} />;
    case 'box_movie':
    case 'box_video':
      return <MovieBoxFeedCard boxId={item.entity_id} prefetchedData={item.prefetchedData} />;
    case 'box_music':
    case 'box_audio':
      return <MusicBoxFeedCard boxId={item.entity_id} prefetchedData={item.prefetchedData} />;
    case 'box_sports':
      return <SportsBoxFeedCard boxId={item.entity_id} prefetchedData={item.prefetchedData} />;
    case 'box_voting':
    case 'box_contest':
      return <VotingBoxFeedCard boxId={item.entity_id} prefetchedData={item.prefetchedData} />;
    case 'user_recommendation_carousel':
      return <UserRecommendationCarousel />;
    case 'channel_recommendation_carousel':
      return (
        <View style={{ marginVertical: 24, width: '100%' }}>
          <DiscoverChannelWidget channelCount={0} userId={useAuthStore.getState().user?.id} />
        </View>
      );
    default:
      return null;
  }
}, (prevProps, nextProps) => {
  if (prevProps.item.id !== nextProps.item.id) return false;
  if (prevProps.isActive !== nextProps.isActive) return false;
  if (prevProps.item.prefetchedData !== nextProps.item.prefetchedData) return false;
  if (prevProps.item.entity_type === 'channel_recommendation_carousel') {
    return prevProps.discoveredChannels === nextProps.discoveredChannels;
  }
  return true;
});

interface MainFeedBodyProps {
  cards: MixedFeedItem[];
  discoveredChannels: CrimChartUserModel[];
  isLoading: boolean;
  isPaginating: boolean;
  isRefreshing: boolean;
  newItemCount?: number;
  onRefresh: () => void;
  onLoadMore: () => void;
  onNewItemsBannerPress?: () => void;
  listRef?: React.RefObject<any>;
}

export const MainFeedBody = ({
  cards,
  discoveredChannels,
  isLoading,
  isPaginating,
  isRefreshing,
  newItemCount = 0,
  onRefresh,
  onLoadMore,
  onNewItemsBannerPress,
  listRef,
}: MainFeedBodyProps) => {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [selectedStatusUser, setSelectedStatusUser] = useState<StatusItem | null>(null);
  const user = useAuthStore(s => s.user);
  const router = useAppRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const styles = useStyles(themeStyles);

  const { statuses: flatStatuses, refresh: refreshStatuses } = useFeedStatuses(user?.id);

  const viewedStatusIds = useViewedStatusStore(s => s.viewedStatusIds);

  const groupedStatuses = React.useMemo(() => {
    const userMap = new Map<string, StatusItem>();

    flatStatuses.forEach(status => {
      if (!userMap.has(status.authorId)) {
        userMap.set(status.authorId, {
          id: status.authorId,
          user: {
            id: status.authorId,
            displayName: status.authorName,
            profileImageUrl: status.authorAvatarUrl
          } as any,
          thumbnailUrl: status.thumbnailUrl || status.imageUrls[0] || status.authorAvatarUrl || '',
          hasUnseen: false, // Default to false, will be calculated later
          statuses: []
        });
      }
      userMap.get(status.authorId)!.statuses!.push(status);
    });

    const result = Array.from(userMap.values());
    result.forEach(group => {
      group.hasUnseen = group.statuses!.some(s => !viewedStatusIds[s.id]);
    });
    return result;
  }, [flatStatuses, viewedStatusIds]);

  const handleAddStatusPress = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedMedia = result.assets.map((asset, index) => ({
          id: `status-media-${Date.now()}-${index}`,
          path: asset.uri,
          type: asset.type === 'video' ? 'video' : 'photo',
          width: asset.width,
          height: asset.height,
        }));

        router.push({
          pathname: '/finalize-post',
          params: {
            selectedMediaJson: JSON.stringify(selectedMedia),
            isGlobalStatus: 'true',
          }
        });
      }
    } catch (e) {
      console.error('Error picking status media:', e);
    }
  };

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 50 },
      onViewableItemsChanged: ({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) {
          setActiveItemId(viewableItems[0].item.id);
        } else {
          setActiveItemId(null);
        }
      },
    },
  ]);

  const renderCard = React.useCallback(({ item }: { item: MixedFeedItem }) => (
    <MemoizedFeedItem
      item={item}
      isActive={item.id === activeItemId}
      discoveredChannels={discoveredChannels}
    />
  ), [activeItemId, discoveredChannels]);


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
        <TouchableOpacity activeOpacity={1} style={styles.newBanner} onPress={onNewItemsBannerPress}>
          <Text style={styles.newBannerText}>↑ {newItemCount} new posts</Text>
        </TouchableOpacity>
      )}

      <FlashList
        ref={listRef}
        data={cards}
        keyExtractor={item => item.id}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        renderItem={renderCard}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.4}
        maintainVisibleContentPosition={{ disabled: false }}
        ListHeaderComponent={
          !isDesktop ? (
            <UserStatusWidget
              currentUser={user}
              statuses={groupedStatuses}
              onAddStatusPress={handleAddStatusPress}
              onStatusPress={(item) => setSelectedStatusUser(item)}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              onRefresh();
              refreshStatuses();
            }}
            tintColor="#FACD11"
          />
        }
        ListFooterComponent={
          <>
            <NoInternetFooter isPaginating={isPaginating} onRetry={onLoadMore} />
            <View style={{ height: 100 }} />
          </>
        }
        showsVerticalScrollIndicator={false}
      />

      <UserStatusViewer
        userId={selectedStatusUser?.id}
        userName={selectedStatusUser?.user.displayName || '-'}
        userAvatarUrl={selectedStatusUser?.user.profileImageUrl || 'https://via.placeholder.com/60'}
        visible={!!selectedStatusUser}
        onClose={() => setSelectedStatusUser(null)}
      />
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => ({
  skeletons: { gap: 12 * scale, padding: 12 * scale },
  newBanner: {
    backgroundColor: colors.primary,
    borderRadius: 20 * scale,
    paddingVertical: 8 * scale,
    paddingHorizontal: 20 * scale,
    alignSelf: 'center' as const,
    marginVertical: 8 * scale,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12 * scale,
    elevation: 6,
  },
  newBannerText: { color: colors.background, fontWeight: '900' as const, fontSize: 13 * scale },
});
