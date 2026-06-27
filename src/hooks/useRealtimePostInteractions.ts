import { useEffect } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useInteractionStore } from '@/core/store/useInteractionStore';

export function useRealtimePostInteractions() {
  useEffect(() => {
    // We create a single channel for listening to likes_count updates on posts and channel_posts
    const channelName = 'public:post_likes_updates';
    
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          if (payload.new && payload.new.likes_count !== undefined) {
            useInteractionStore.getState().syncRealtimeLikeCount(payload.new.id, payload.new.likes_count);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'channel_posts'
        },
        (payload) => {
          if (payload.new && payload.new.likes_count !== undefined) {
            useInteractionStore.getState().syncRealtimeLikeCount(payload.new.id, payload.new.likes_count);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[useRealtimePostInteractions] 🟢 Subscribed to realtime likes updates`);
        }
      });

    return () => {
      console.log(`[useRealtimePostInteractions] 🔴 Unsubscribing from realtime likes updates`);
      supabase.removeChannel(channel);
    };
  }, []);
}
