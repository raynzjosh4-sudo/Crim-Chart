import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';


import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { InboxFullPage } from '@/features/messaging/pages/InboxFullPage';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { MainBottomAppBar } from '../features/bottomappbar/widgets/MainBottomAppBar';
import { MainFeedCardModel, MainFeedCardType, ScrollViewType } from '../models/MainFeedCardTypeModel';
import { MainFeedAppBar } from './main_page_widgets/MainFeedAppBar';
import { MainFeedBody } from './main_page_widgets/MainFeedBody';

const VidsPlaceholder = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    {/* Minimal placeholder for the Vids/Shorts tab */}
    <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Shorts / Vids coming soon</Text>
  </View>
);

const PAGE_SIZE = 15;
const NUKE_KEY = 'db_nuke_v1_done';

export const MainFeedPage = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cards, setCards] = useState<MainFeedCardModel[]>([]);
  const [discoveredChannels, setDiscoveredChannels] = useState<CrimChartUserModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newItemCount, setNewItemCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);

  // One-time nuke on first launch
  useEffect(() => {
    // cache cleared on first launch (AsyncStorage removed)
  }, []);

  // Initial load
  useEffect(() => {
    loadFeed(true);
    loadDiscoveryChannels();
  }, []);

  const loadFeed = useCallback(async (reset = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (reset) setIsLoading(true);

    try {
      const currentPage = reset ? 0 : page;
      const { data, error } = await supabase.rpc('get_social_discovery_feed', {
        p_user_id: user?.id || null, // Pass null if no user to avoid Postgres UUID cast error
        p_limit: PAGE_SIZE,
        p_offset: currentPage * PAGE_SIZE,
      });

      if (error) throw error;

      const newCards: MainFeedCardModel[] = (data ?? []).map((row: any) => {
        // Map the image urls safely
        let images: string[] = [];
        if (Array.isArray(row.image_urls)) {
          images = row.image_urls;
        } else if (typeof row.image_urls === 'string') {
          try {
            const parsed = JSON.parse(row.image_urls);
            if (Array.isArray(parsed)) images = parsed;
          } catch (e) {
            // ignore JSON parse error
          }
        }

        return {
          id: String(row.id),
          // We use socialPost to leverage the ChannelAndFeedPostModel which respects widgetType
          cardType: MainFeedCardType.socialPost,
          scrollViewType: ScrollViewType.vertical,
          link: row.widget_type === 'channel_post' ? `/channel/${row.channel_id}` : `/post/${row.id}`,
          itemData: {
            id: String(row.id),
            author: {
              id: String(row.author_id ?? ''),
              displayName: String(row.author_username ?? 'User'),
              profileImageUrl: row.author_avatar_url,
              followersCount: 0, followingCount: 0,
              isActive: false, statusCount: 0, channelsCreatedCount: 0,
            },
            channel: { 
              id: String(row.channel_id ?? 'user_feed'), 
              title: String(row.channel_name ?? 'Personal Post'),
              imageUrl: row.channel_avatar_url,
            },
            imageUrls: images,
            caption: String(row.caption ?? ''),
            videoUrl: row.video_url,
            isVideo: Boolean(row.is_video ?? false),
            videoUrls: [], isAudio: false, isGif: false, isText: false,
            thumbnailLinkType: 'image',
            tagsCount: 0, likesCount: Number(row.likes ?? 0),
            commentsCount: Number(row.comments ?? 0),
            timeAgo: new Date(row.created_at || Date.now()).toLocaleDateString(),
            isLiked: false, isSponsored: false,
            hasStatus: false, isActive: false, isPending: 0, localFileCache: '',
            widgetType: row.widget_type === 'regular_post' ? 'regular_post' : 'channel_post',
          },
        };
      });

      if (reset) {
        setCards(newCards);
        setPage(1);
      } else {
        setCards([...cards, ...newCards]);
        setPage(page + 1);
      }
      setHasMore(newCards.length === PAGE_SIZE);
    } catch (e) {
      console.error('[MainFeedPage] loadFeed error:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [page, cards, user?.id]);

  const loadDiscoveryChannels = async () => {
    try {
      const { data, error } = await supabase.rpc('get_social_discovery_channels', {
        p_user_id: user?.id || null, // Pass null instead of empty string
        p_limit: 10,
        p_offset: 0,
      });
      if (error) throw error;

      setDiscoveredChannels(
        (data ?? []).map((r: any): CrimChartUserModel => new CrimChartUserModel({
          id: String(r.id),
          displayName: r.name ?? 'Channel',
          profileImageUrl: r.avatar_url,
          bio: r.description,
          followersCount: r.members_count ?? r.followers_count ?? 0,
          followingCount: 0,
          isActive: false,
          statusCount: 0,
          channelsCreatedCount: 0,
          channelCount: 0,
          giftsEarned: 0, coinsEarned: 0,
          username: r.name ?? 'Channel',
          role: '', isVerified: false,
          hasStatus: false, isFollowing: false, isMe: false,
        })),
      );
    } catch (e) {
      console.error('[MainFeedPage] loadDiscoveryChannels error:', e);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setNewItemCount(0);
    await loadFeed(true);
    await loadDiscoveryChannels();
  };

  const handleLoadMore = () => {
    if (hasMore && !isFetchingRef.current) loadFeed(false);
  };

  const onItemTapped = (index: number) => {
    if (index === 0 && selectedIndex === 0) {
      handleRefresh();
      setNewItemCount(0);
      return;
    }
    if (index === 2) {
      router.push('/first-post');
      return;
    }
    setSelectedIndex(index);
    if (index === 0) setNewItemCount(0);
  };

  return (
    <View style={styles.root}>
      <MainFeedAppBar
        badgeCount={newItemCount}
        onSearchPress={() => navigation.navigate('Search')}
        onBellPress={() => { }}
      />

      {selectedIndex === 0 && (
        <MainFeedBody
          cards={cards}
          discoveredChannels={discoveredChannels}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          newItemCount={newItemCount}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          onNewItemsBannerPress={() => {
            setNewItemCount(0);
            handleRefresh();
          }}
        />
      )}

      {selectedIndex === 1 && <VidsPlaceholder />}
      {selectedIndex === 3 && <InboxFullPage />}


      <MainBottomAppBar
        selectedIndex={selectedIndex}
        onItemTapped={onItemTapped}
        homeBadgeCount={newItemCount}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
});


