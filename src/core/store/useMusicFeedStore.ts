import { create } from 'zustand';
import { supabase } from '@/core/supabase/supabaseConfig';
import { MusicTrackItem } from '@/features/boxes/components/music_posting/tiles/MusicListTile';
import { NativeDB } from '@/core/db/NativeDB';

interface MusicFeedStore {
  prefetchedTracks: MusicTrackItem[];
  isPrefetched: boolean;
  prefetch: () => Promise<void>;
  clearPrefetch: () => void;
}

export const useMusicFeedStore = create<MusicFeedStore>((set, get) => ({
  prefetchedTracks: [],
  isPrefetched: false,
  prefetch: async () => {
    if (get().isPrefetched) return; // already prefetched

    try {
      const { data, error } = await supabase.rpc('get_music_feed', {
        p_limit: 10,
        p_offset: 0
      });

      if (error) throw error;

      if (data) {
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

        // Save to SQLite for offline availability and instant loading
        await NativeDB.saveMusicFeed(mappedTracks, true);
        
        set({ prefetchedTracks: mappedTracks, isPrefetched: true });
      }
    } catch (e) {
      console.error('Error prefetching music feed:', e);
    }
  },
  clearPrefetch: () => set({ prefetchedTracks: [], isPrefetched: false })
}));
