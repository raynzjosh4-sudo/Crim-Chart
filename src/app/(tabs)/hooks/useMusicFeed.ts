import { useState, useEffect } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { MusicTrackItem } from '@/features/boxes/components/music_posting/tiles/MusicListTile';

export function useMusicFeed(searchQuery?: string) {
  const [tracks, setTracks] = useState<MusicTrackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 10;

  const fetchMusicFeed = async (reset: boolean = false) => {
    if (reset) {
      setIsLoading(true);
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

      if (searchQuery && searchQuery.trim() !== '') {
        rpcName = 'search_music_feed';
        rpcParams.p_search_query = searchQuery.trim();
      }

      const { data, error } = await supabase.rpc(rpcName, rpcParams);

      if (error) {
        throw error;
      }

      if (data) {
        const mappedTracks: MusicTrackItem[] = data.map((row: any) => {
          const postData = row.post_data || {};
          const authorData = row.author || {};
          
          // channel_posts uses 'likes', 'comments', 'image_urls' whereas 'posts' might use 'likes_count', etc.
          // Parse image_urls if it's a string array, or use thumbnail_url
          let coverUrl = postData.thumbnail_url || authorData.profile_image_url || '';
          if (!postData.thumbnail_url && postData.image_urls) {
            try {
              const urls = typeof postData.image_urls === 'string' ? JSON.parse(postData.image_urls) : postData.image_urls;
              if (Array.isArray(urls) && urls.length > 0) coverUrl = urls[0];
            } catch (e) {}
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
            lyrics: postData.lyrics || '',
            sourceTable: row.source_table || 'posts',
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
  }, [searchQuery]);

  return { tracks, isLoading, isFetchingMore, hasMore, fetchMore, refetch: () => fetchMusicFeed(true) };
}
