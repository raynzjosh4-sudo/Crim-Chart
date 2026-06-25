import { supabase } from '@/core/supabase/client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { NativeDB } from '@/core/db/NativeDB';

export interface TrendingTrack {
  id: string;
  postId?: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  audioUrl: string;
  videoUrl: string;
  isAudio: boolean;
  isShort: boolean;
  likes: number;
}

const PAGE_SIZE = 10;

export const useTrendingBoxItems = (boxId?: string) => {
  const [items, setItems] = useState<TrendingTrack[]>([]);
  const itemsRef = useRef<TrendingTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (!boxId) return;

    let isMounted = true;
    const loadFromCache = async () => {
      try {
        const cached = await NativeDB.getTrendingBoxItems(boxId);
        if (isMounted && cached && cached.length > 0) {
          setItems(cached);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[useTrendingBoxItems] Error loading cache:', err);
      }
    };

    loadFromCache();
    // Proceed to trigger network fetch below
  }, [boxId]);

  const fetchItems = useCallback(async (pageIndex: number, isInitial = false) => {
    if (!boxId) return;
    
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsPaginating(true);
    }

    try {
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Fetch box_items for this box, ordered by likes_count descending
      const { data: boxItemsData, error } = await supabase
        .from('box_items')
        .select('id, post_id, likes_count')
        .eq('box_id', boxId)
        .order('likes_count', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching trending box items:', error);
        return;
      }

      if (boxItemsData && boxItemsData.length > 0) {
        const postIds = boxItemsData.map((b: any) => b.post_id);

        // Fetch details from both posts and channel_posts
        const [postsResponse, channelPostsResponse] = await Promise.all([
          supabase.from('posts').select('id, caption, metadata, audio_url, video_url, thumbnail_urls, type, is_video, is_audio').in('id', postIds),
          supabase.from('channel_posts').select('id, caption, author_username, audio_url, video_url, thumbnail_urls, post_type, is_video, is_audio').in('id', postIds)
        ]);

        const postsMap = new Map();
        
        if (postsResponse.data) {
          postsResponse.data.forEach((p: any) => postsMap.set(p.id, { ...p, _type: 'post' }));
        }
        if (channelPostsResponse.data) {
          channelPostsResponse.data.forEach((cp: any) => postsMap.set(cp.id, { ...cp, _type: 'channel_post' }));
        }

        const formattedItems: TrendingTrack[] = boxItemsData.map((item: any) => {
          const postData = postsMap.get(item.post_id);
          let title = 'Untitled';
          let artist = 'Unknown';
          let thumbnailUrl = '';
          let audioUrl = '';
          let videoUrl = '';
          let isAudio = false;
          let isShort = false;

          if (postData) {
            title = postData.caption || (postData.metadata?.title) || title;
            artist = postData.author_username || (postData.metadata?.artist) || artist;
            
            if (Array.isArray(postData.thumbnail_urls) && postData.thumbnail_urls.length > 0) {
              thumbnailUrl = postData.thumbnail_urls[0];
            } else if (postData.thumbnail_urls && typeof postData.thumbnail_urls === 'string') {
              thumbnailUrl = postData.thumbnail_urls;
            } else if (postData.metadata?.coverUrl) {
              thumbnailUrl = postData.metadata.coverUrl;
            }

            audioUrl = postData.audio_url || postData.video_url || '';
            videoUrl = postData.video_url || '';
            isAudio = postData.is_audio || false;
            isShort = postData.type === 'short';
          }

          return {
            id: item.id,
            postId: item.post_id,
            title,
            artist,
            thumbnailUrl,
            audioUrl,
            videoUrl,
            isAudio,
            isShort,
            likes: item.likes_count || 0,
          };
        });
        
        if (isInitial) {
          await NativeDB.saveTrendingBoxItems(boxId, formattedItems);
          setItems(formattedItems);
        } else {
          setItems([...itemsRef.current, ...formattedItems]);
        }

        setHasMore(boxItemsData.length === PAGE_SIZE);
      } else {
        if (isInitial) {
          await NativeDB.saveTrendingBoxItems(boxId, []);
          setItems([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error('Exception fetching trending box items:', err);
    } finally {
      setIsLoading(false);
      setIsPaginating(false);
    }
  }, [boxId]);

  useEffect(() => {
    if (boxId) {
      setPage(0);
      setHasMore(true);
      fetchItems(0, true);
    } else {
      setIsLoading(false);
      setItems([]);
    }
  }, [boxId, fetchItems]);

  const loadMore = useCallback(() => {
    if (!isLoading && !isPaginating && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchItems(nextPage, false);
    }
  }, [isLoading, isPaginating, hasMore, page, fetchItems]);

  return { items, isLoading, isPaginating, hasMore, loadMore };
};
