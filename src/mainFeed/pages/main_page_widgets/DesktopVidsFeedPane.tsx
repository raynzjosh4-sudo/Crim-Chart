import { VideoCardSkeleton } from '@/components/skeletons/Skeletons';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { VideoPostFeedCard } from './VideoPostFeedCard';
import { useDesktopVidsStore } from './useDesktopVidsStore';

interface ShortVideoItem {
  id: string;
  entity_id: string;
  prefetchedData: any;
}

/**
 * Renders a scrollable list of short-video feed cards inside the desktop feed column.
 * Used when the user clicks "Vids" in the desktop sidebar.
 */
export const DesktopVidsFeedPane: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const [items, setItems] = useState<ShortVideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 50 },
      onViewableItemsChanged: ({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
          setActiveIndex(viewableItems[0].index);
        }
      },
    },
  ]);

  useEffect(() => {
    if (items.length > 0 && items[activeIndex]) {
      const item = items[activeIndex];
      useDesktopVidsStore.getState().setActiveVideo(
        item.entity_id, 
        item.prefetchedData?.channelId || item.prefetchedData?.channel?.id,
        item.prefetchedData?.channelName || item.prefetchedData?.channel?.name
      );
    }
  }, [activeIndex, items]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase.rpc('get_short_video_feed_with_data', {
          p_user_id: user?.id ?? null,
          p_limit: 30,
          p_offset: 0,
        });

        if (error) {
          throw error;
        }
        
        if (!isMounted) return;

        // Fetch full post data for each short video so VideoPostFeedCard has prefetchedData
        const postIds = (data ?? []).map((r: any) => r.id).filter(Boolean);
        let postsMap = new Map<string, any>();

        if (postIds.length > 0) {
          const [postsRes, channelPostsRes] = await Promise.all([
            supabase
              .from('posts')
              .select('*, author:profiles!author_id (id, display_name, profile_image_url)')
              .in('id', postIds),
            supabase
              .from('channel_posts')
              .select('*, author:profiles!author_id (id, display_name, profile_image_url), channel:channels!channel_id (allow_commenting_by)')
              .in('id', postIds),
          ]);
          for (const p of (postsRes.data ?? [])) postsMap.set(p.id, p);
          for (const p of (channelPostsRes.data ?? [])) postsMap.set(p.id, p);
        }

        const mapped: ShortVideoItem[] = (data ?? []).map((row: any) => ({
          id: row.pointer_id ?? row.id,
          entity_id: row.id,
          prefetchedData: postsMap.get(row.id) ?? row,
        }));

        if (isMounted) setItems(mapped);

        if (postIds.length > 0) {
          useInteractionStore.getState().syncPostInteractions(postIds);
        }
        
      } catch (e) {
        console.error('[DesktopVidsFeedPane] fetch error:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [user?.id]);

  const renderItem = useCallback(({ item, index }: { item: ShortVideoItem; index: number }) => {
    let preloadStatus: 'playing' | 'preloading' | 'idle' = 'idle';
    if (index === activeIndex) preloadStatus = 'playing';
    else if (index >= activeIndex - 1 && index <= activeIndex + 2) preloadStatus = 'preloading';

    return (
      <VideoPostFeedCard
        postId={item.entity_id}
        preloadStatus={preloadStatus}
        entityType="short_video_post"
        prefetchedData={item.prefetchedData}
      />
    );
  }, [activeIndex]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {Array.from({ length: 3 }).map((_, i) => <VideoCardSkeleton key={i} />)}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
};
