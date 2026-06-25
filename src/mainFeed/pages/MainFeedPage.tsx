import { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, AppState, Dimensions, InteractionManager, useWindowDimensions } from 'react-native';

import { ChannelButton } from '@/components/ChannelButton/ChannelButton';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Bell, Search } from 'lucide-react-native';
import { MixedFeedItem } from '../models/MixedFeedItem';
import { MainFeedBody } from './main_page_widgets/MainFeedBody';
import { MainFeedSkeletonCard } from './main_page_widgets/MainFeedSkeletonCard';


const PAGE_SIZE = 15;
const NUKE_KEY = 'db_nuke_v1_done';

export const MainFeedPage = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  const [cards, setCards] = useState<MixedFeedItem[]>([]);
  const [discoveredChannels, setDiscoveredChannels] = useState<CrimChartUserModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newItemCount, setNewItemCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);
  const pageRef = useRef(0);
  const cardsRef = useRef<MixedFeedItem[]>([]);

  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [isReady, setIsReady] = useState(false);

  // One-time nuke on first launch
  useEffect(() => {
    // cache cleared on first launch (AsyncStorage removed)
    InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
  }, []);

  // Initial load when user becomes available
  useEffect(() => {
    if (user?.id) {
      loadFeed(true);
      loadDiscoveryChannels();
    }
  }, [user?.id]);

  // Realtime: reload feed when the current user creates a new box
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`own_boxes_watcher_${user.id}_${Math.random()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'boxes',
        filter: `owner_id=eq.${user.id}`,
      }, () => {
        console.log('[MainFeedPage] New box detected — reloading feed');
        loadFeed(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // AppState: reload feed when app comes back to foreground from background
  useEffect(() => {
    if (!user?.id) return;
    let previousState = AppState.currentState;
    const sub = AppState.addEventListener('change', (nextState) => {
      if (previousState.match(/background|inactive/) && nextState === 'active') {
        console.log('[MainFeedPage] App foregrounded — reloading feed');
        loadFeed(true);
      }
      previousState = nextState;
    });
    return () => sub.remove();
  }, [user?.id]);

  const loadFeed = useCallback(async (reset = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (reset) setIsLoading(true);
    else setIsPaginating(true);

    try {
      const currentPage = reset ? 0 : pageRef.current;
      const { data, error } = await supabase.rpc('get_mixed_feed', {
        p_user_id: user?.id || null,
        p_limit: PAGE_SIZE,
        p_offset: currentPage * PAGE_SIZE,
      });

      if (error) {
        throw error;
      }

      // console.log('[MainFeedPage] get_mixed_feed first row:', data && data.length > 0 ? data[0] : 'No data');
      // console.log('[MainFeedPage] get_mixed_feed RAW DATA (' + (data?.length ?? 0) + ' items):', JSON.stringify(data, null, 2));

      const rawRpcCount = data?.length ?? 0; // Track the real DB row count for hasMore

      const rawCards: MixedFeedItem[] = (data ?? []).map((row: any) => ({
        id: row.id,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        source_type: row.source_type,
        created_at: row.created_at,
      }));

      // 1. Gather all unique IDs by source type
      const postIds = new Set<string>();
      const channelPostIds = new Set<string>();
      const boxIds = new Set<string>();

      for (const item of rawCards) {
        // Check entity_type for boxes FIRST — old records may have source_type='post'
        // but entity_type='box_video'/'box_audio' etc., so entity_type wins.
        if (item.entity_type.includes('box')) {
          boxIds.add(item.entity_id);
        } else if (item.source_type === 'channel_post' || item.entity_type === 'channel_post') {
          channelPostIds.add(item.entity_id);
        } else if (item.source_type === 'post' || item.entity_type.includes('post')) {
          postIds.add(item.entity_id);
        }
      }

      // CLIENT-SIDE BOX INJECTION: If no boxes came from the RPC (triggers not deployed),
      // directly fetch the user's own boxes and inject them into the feed on page 0.
      if (reset && currentPage === 0 && user?.id && boxIds.size === 0) {
        const { data: ownBoxes } = await supabase
          .from('boxes')
          .select('id, box_type, created_at')
          .eq('owner_id', user.id)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (ownBoxes && ownBoxes.length > 0) {
          // console.log('[MainFeedPage] Injecting', ownBoxes.length, 'own boxes into feed (trigger bypass)');
          for (const box of ownBoxes) {
            boxIds.add(box.id);
            // Inject a synthetic feed card for each box at the TOP
            rawCards.unshift({
              id: `injected_box_${box.id}`,
              entity_type: `box_${box.box_type}`,
              entity_id: box.id,
              source_type: 'box',
              created_at: box.created_at,
            });
          }
        }
      }

      // 2. Fetch all parent entities in exactly 3 batched parallel requests
      const [postsRes, channelPostsRes, boxesRes] = await Promise.all([
        postIds.size > 0
          ? supabase.from('posts').select(`*, author:profiles!author_id (id, display_name, profile_image_url, is_online, has_status, status_count)`).in('id', Array.from(postIds))
          : Promise.resolve({ data: [] }),
        channelPostIds.size > 0
          ? supabase.from('channel_posts').select(`*, author:profiles!author_id (id, display_name, profile_image_url, is_online, has_status, status_count), channel:channels!channel_id (allow_commenting_by, join_method, age_restriction, country_restrictions)`).in('id', Array.from(channelPostIds))
          : Promise.resolve({ data: [] }),
        boxIds.size > 0
          ? supabase.from('boxes').select(`*, owner:profiles!owner_id (id, display_name, profile_image_url, crown_title), trending_items:box_items (id, likes_count, post_id)`).in('id', Array.from(boxIds))
            .order('likes_count', { foreignTable: 'box_items', ascending: false })
            .limit(2, { foreignTable: 'box_items' })
          : Promise.resolve({ data: [] })
      ]);

      const postsMap = new Map((postsRes.data || []).map(p => [p.id, p]));
      const channelPostsMap = new Map((channelPostsRes.data || []).map(p => [p.id, p]));
      const boxesMap = new Map((boxesRes.data || []).map(b => [b.id, b]));

      // console.log('[FEED DEBUG] Step 2 — boxes fetched from DB:', boxesRes.data?.length ?? 0, 'error:', boxesRes.error?.message ?? 'none');
      // console.log('[FEED DEBUG] Step 2 — boxesMap keys:', Array.from(boxesMap.keys()));

      // 3. Extract all trending posts for the boxes and fetch their thumbnails
      const trendingPostIds = new Set<string>();
      for (const box of (boxesRes.data || [])) {
        if (box.trending_items) {
          for (const t of box.trending_items) {
            if (t.post_id) trendingPostIds.add(t.post_id);
          }
        }
      }

      const trendingPostsMap = new Map<string, any>();
      if (trendingPostIds.size > 0) {
        const { data: trendingPostsData, error: trendingErr } = await supabase
          .from('posts')
          .select('id, caption, metadata, thumbnail_urls, video_urls, image_urls, video_url, audio_url')
          .in('id', Array.from(trendingPostIds));
        // console.log('[FEED DEBUG] Trending posts raw from DB:', JSON.stringify(trendingPostsData, null, 2));
        // console.log('[FEED DEBUG] Trending posts error:', trendingErr?.message ?? 'none');
        for (const tp of (trendingPostsData || [])) {
          trendingPostsMap.set(tp.id, tp);
        }
      }

      // 4. Attach formatted trendingTracks to the box objects
      for (const box of (boxesRes.data || [])) {
        if (box.trending_items) {
          box.trendingTracks = box.trending_items.map((item: any) => {
            const post = trendingPostsMap.get(item.post_id) || {};
            const metadata = post.metadata || {};

            // Parse JSONB arrays safely
            let thumbnailUrls: string[] = [];
            try { thumbnailUrls = typeof post.thumbnail_urls === 'string' ? JSON.parse(post.thumbnail_urls) : (post.thumbnail_urls || []); } catch (e) { }
            let videoUrls: string[] = [];
            try { videoUrls = typeof post.video_urls === 'string' ? JSON.parse(post.video_urls) : (post.video_urls || []); } catch (e) { }
            let imageUrls: string[] = [];
            try { imageUrls = typeof post.image_urls === 'string' ? JSON.parse(post.image_urls) : (post.image_urls || []); } catch (e) { }

            const thumbnailUrl = thumbnailUrls[0] || videoUrls[0] || imageUrls[0] || post.video_url || post.audio_url || metadata.thumbnailUrl || metadata.thumbnail_url || '';
            const mediaUrl = post.video_url || videoUrls[0] || post.audio_url || metadata.mediaUrl || metadata.videoUrl || metadata.audioUrl || '';

            return {
              id: item.id,
              post_id: item.post_id,
              title: post.caption || metadata.title || metadata.name || 'Unknown Item',
              artist: metadata.artist || metadata.creatorName || metadata.author || 'Unknown Artist',
              thumbnailUrl,
              likes: item.likes_count || 0,
              price: metadata.price || undefined,
              mediaUrl,
            };
          });
        }
      }

      // 5. Map back into newCards
      const newCards = rawCards.map((item) => {
        let prefetchedData: any = null;
        if (item.source_type === 'channel_post') {
          prefetchedData = channelPostsMap.get(item.entity_id);
        } else if (item.source_type === 'post') {
          prefetchedData = postsMap.get(item.entity_id);
        } else if (item.source_type === 'box') {
          prefetchedData = boxesMap.get(item.entity_id);
        } else if (item.entity_type.includes('post')) {
          prefetchedData = channelPostsMap.get(item.entity_id) || postsMap.get(item.entity_id);
        } else if (item.entity_type.includes('box')) {
          prefetchedData = boxesMap.get(item.entity_id);
        }
        return { ...item, prefetchedData };
      }).filter((item) => {
        if (item.source_type === 'post' && item.prefetchedData?.metadata?.is_box_shadow_post) {
          return false;
        }
        return true;
      });

      const boxCards = newCards.filter(c => c.source_type === 'box' || c.entity_type.includes('box'));
      // console.log('[FEED DEBUG] Step 3 — box cards in final newCards:', boxCards.length);
      // boxCards.forEach(c => console.log('  box:', c.entity_type, '| prefetchedData.id:', c.prefetchedData?.id ?? 'MISSING'));

      if (reset) {
        pageRef.current = 1;
        cardsRef.current = newCards;
        setCards(newCards);
        setPage(1);
        setHasMore(rawRpcCount >= PAGE_SIZE);
      } else {
        pageRef.current += 1;
        // Deduplicate new cards
        const existingIds = new Set(cardsRef.current.map(c => c.id));
        const uniqueNewCards = newCards.filter(c => !existingIds.has(c.id));

        cardsRef.current = [...cardsRef.current, ...uniqueNewCards];
        setCards(cardsRef.current);
        setPage(pageRef.current);
        // Break the loop if we only got duplicates
        if (uniqueNewCards.length === 0 && newCards.length > 0) {
          setHasMore(false);
        } else {
          setHasMore(rawRpcCount >= PAGE_SIZE);
        }
      }
    } catch (e) {
      console.error('[MainFeedPage] loadFeed error:', e);
    } finally {
      setIsLoading(false);
      setIsPaginating(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [user?.id]);

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



  return (
    <View style={styles.root}>
      <ChartAppBar
        title=""
        leading={
          <Text style={styles.appBarTitle}>
            CrimChart
          </Text>
        }
        showBack={false}
        backgroundColor={theme.colors.background}
        showBorder={false}
        actions={!isDesktop ? [
          <ChannelButton key="channels" />,
          <TouchableOpacity activeOpacity={1} key="search" onPress={() => (navigation as any).navigate('Search')} style={styles.headerIconBtn}>
            <Search color={theme.colors.text} size={24} />
          </TouchableOpacity>,
          <TouchableOpacity activeOpacity={1} key="bell" onPress={() => { }} style={[styles.headerIconBtn, { position: 'relative' }]}>
            <Bell color={theme.colors.text} size={24} />
            {newItemCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {newItemCount > 99 ? '99+' : newItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ] : []}
      />

      {isReady ? (
        <MainFeedBody
          cards={cards}
          discoveredChannels={discoveredChannels}
          isLoading={isLoading}
          isPaginating={isPaginating}
          isRefreshing={isRefreshing}
          newItemCount={newItemCount}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          onNewItemsBannerPress={() => {
            setNewItemCount(0);
            handleRefresh();
          }}
        />
      ) : (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <MainFeedSkeletonCard key={i} />
          ))}
        </View>
      )}
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => ({
  root: { flex: 1, backgroundColor: colors.background },
  appBarTitle: { color: colors.primary, fontSize: 22 * scale, fontWeight: '900' as const, letterSpacing: -1, marginLeft: 8 },
  headerIconBtn: { padding: 8 },
  notificationBadge: {
    position: 'absolute' as const, 
    top: 4, 
    right: 4,
    backgroundColor: colors.error, 
    borderRadius: 10 * scale,
    minWidth: 18 * scale, 
    height: 18 * scale, 
    justifyContent: 'center' as const, 
    alignItems: 'center' as const,
    paddingHorizontal: 4, 
    borderWidth: 1.5, 
    borderColor: colors.background
  },
  notificationBadgeText: { color: colors.text, fontSize: 10 * scale, fontWeight: '800' as const }
});


