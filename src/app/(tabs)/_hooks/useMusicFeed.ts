import { supabase } from '@/core/supabase/supabaseConfig';
import { MusicTrackItem } from '@/features/boxes/components/music_posting/tiles/MusicListTile';
import { useEffect, useState } from 'react';
import { useMusicFeedStore } from '@/core/store/useMusicFeedStore';
import { NativeDB } from '@/core/db/NativeDB';

export function useMusicFeed(searchQuery?: string, category?: string) {
  const [tracks, setTracks] = useState<MusicTrackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 10;

  const fetchMusicFeed = async (reset: boolean = false) => {
    if (reset) {
      const store = useMusicFeedStore.getState();
      if (store.isPrefetched && (!searchQuery || searchQuery.trim() === '')) {
        setTracks(store.prefetchedTracks);
        setOffset(LIMIT);
        setHasMore(store.prefetchedTracks.length === LIMIT);
        setIsLoading(false);
        store.clearPrefetch();
        return; // Prefetch gives us fresh data, no need to fetch again immediately
      }

      // If no prefetch, try to load from SQLite for instant UI
      if (!searchQuery || searchQuery.trim() === '') {
        const localTracks = await NativeDB.getMusicFeed(LIMIT, 0);
        if (localTracks && localTracks.length > 0) {
          setTracks(localTracks);
          setOffset(LIMIT);
          setIsLoading(false); // Stop loading indicator instantly
        }
      }

      // Even if we loaded from SQLite, we continue to fetch fresh data from Supabase below
      // unless we already returned from the prefetch block.
      if (tracks.length === 0) {
        setIsLoading(true);
      }
      setOffset(0);
      setHasMore(true);
    } else {
      if (!hasMore || isFetchingMore) return;
      setIsFetchingMore(true);
    }
    
    const currentOffset = reset ? 0 : offset;

    try {
      let rpcName = 'get_music_feed';
      let rpcParams: any = {
        p_limit: LIMIT,
        p_offset: currentOffset
      };

      if (category && category !== 'All') {
        rpcParams.p_category = category;
      }

      if (searchQuery && searchQuery.trim() !== '') {
        rpcName = 'search_music_feed';
        rpcParams.p_search_query = searchQuery.trim();
      }

      const { data, error } = await supabase.rpc(rpcName, rpcParams);

      if (error) {
        throw error;
      }

      if (data) {
        if (data.length > 0) {
          console.log('\n\n--- MUSIC FEED RAW DATA DEBUG ---');
          console.log(JSON.stringify(data[0], null, 2));
          console.log('----------------------------------\n\n');
        }

        const mappedTracks: MusicTrackItem[] = data.map((row: any) => {
          const postData = row.post_data || {};
          const authorData = row.author || {};
          
          // channel_posts uses 'likes', 'comments', 'image_urls' whereas 'posts' might use 'likes_count', etc.
          // Parse image_urls if it's a string array, or use thumbnail_url
          let coverUrl = postData.cover_url || postData.thumbnail_url || '';
          
          if (!coverUrl && Array.isArray(postData.thumbnail_urls) && postData.thumbnail_urls.length > 0) {
            coverUrl = postData.thumbnail_urls[0];
          }

          if (!coverUrl && postData.image_urls) {
            try {
              const urls = typeof postData.image_urls === 'string' ? JSON.parse(postData.image_urls) : postData.image_urls;
              if (Array.isArray(urls) && urls.length > 0) coverUrl = urls[0];
            } catch (e) {}
          }
          
          if (!coverUrl && postData.image_url) {
            coverUrl = postData.image_url;
          }

          let metadata: any = {};
          if (postData.metadata) {
            try {
              metadata = typeof postData.metadata === 'string' ? JSON.parse(postData.metadata) : postData.metadata;
            } catch (e) {}
          }

          if (metadata.coverUrl) {
            coverUrl = metadata.coverUrl;
          }
          
          if (!coverUrl) {
            coverUrl = authorData.profile_image_url || '';
          }

          return {
            id: postData.id,
            title: metadata.title || postData.title || postData.caption || 'Unknown Title',
            artist: metadata.artist || postData.artist || authorData.display_name || 'Unknown Artist',
            coverUrl: coverUrl,
            audioUrl: postData.audio_url || postData.media_url || '',
            likesCount: postData.likes_count ?? postData.likes ?? 0,
            commentsCount: postData.comments_count ?? postData.comments ?? 0,
            viewsCount: postData.views_count ?? postData.views ?? 0,
            downloadsCount: postData.downloads_count ?? 0,
            owner: {
              id: authorData.id,
              name: authorData.display_name || 'Unknown Artist',
              avatarUrl: authorData.profile_image_url || '',
              crownTitle: authorData.crown_title || '',
            },
            lyrics: metadata.lyrics || postData.lyrics || '',
            sourceTable: row.source_table || 'posts',
            caption: postData.caption || '',
            createdAt: postData.created_at || postData.time || new Date().toISOString(),
          };
        });
        
        if (mappedTracks.length < LIMIT) {
          setHasMore(false);
        }

        if (reset) {
          setTracks(mappedTracks);
        } else {
          setTracks([...tracks, ...mappedTracks]);
        }
        setOffset(currentOffset + LIMIT);
      } else {
        setHasMore(false);
        if (reset) setTracks([]);
      }
    } catch (e) {
      console.error('Error fetching music feed:', e);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  const fetchMore = () => {
    fetchMusicFeed(false);
  };

  useEffect(() => {
    fetchMusicFeed(true);
  }, [searchQuery, category]);

  return { tracks, isLoading, isFetchingMore, hasMore, fetchMore, refetch: () => fetchMusicFeed(true) };
}
