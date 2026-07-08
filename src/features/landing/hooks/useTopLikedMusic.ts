import { supabase } from '@/core/supabase/supabaseConfig';
import { MusicTrackItem } from '@/features/boxes/components/music_posting/tiles/MusicListTile';
import { useEffect, useState } from 'react';

export function useTopLikedMusic(category?: string) {
  const [tracks, setTracks] = useState<MusicTrackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopLikedMusic = async () => {
      setIsLoading(true);

      try {
        let rpcParams: any = {
          p_limit: 20,
          p_offset: 0
        };

        if (category && category !== 'All') {
          rpcParams.p_category = category;
        }

        const { data, error } = await supabase.rpc('get_top_liked_music', rpcParams);

        if (error) {
          throw error;
        }

        if (data) {
          const mappedTracks: MusicTrackItem[] = data.map((row: any) => {
            const postData = row.post_data || {};
            const authorData = row.author || {};
            
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
          
          setTracks(mappedTracks);
        } else {
          setTracks([]);
        }
      } catch (e) {
        console.error('Error fetching top liked music:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopLikedMusic();
  }, [category]);

  return { tracks, isLoading };
}
