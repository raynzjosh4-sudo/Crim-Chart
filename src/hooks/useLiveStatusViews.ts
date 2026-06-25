import { useState, useEffect } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';

export function useLiveStatusViews(userId?: string) {
  const [viewsCount, setViewsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setViewsCount(0);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let channel: any;

    const init = async () => {
      // 1. Fetch initial count
      const { data, error } = await supabase
        .from('profiles')
        .select('active_status_views_count')
        .eq('id', userId)
        .single();
        
      if (isMounted) {
        if (!error && data) {
          setViewsCount(data.active_status_views_count || 0);
        }
        setIsLoading(false);
      }

      // 2. Subscribe to realtime updates for this user
      // Only subscribe if component is still mounted after the async await above
      if (isMounted) {
        const channelName = `profile-views-${userId}`;
        // Ensure any leaked channel with the same name is removed first
        supabase.getChannels().forEach((c) => {
          if (c.topic === `realtime:${channelName}`) {
            supabase.removeChannel(c);
          }
        });

        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${userId}`,
            },
            (payload) => {
              if (isMounted && payload.new) {
                const newCount = payload.new.active_status_views_count;
                setViewsCount(newCount || 0);
              }
            }
          )
          .subscribe();
      }
    };

    init();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  // Listen for local manual resets to instantly update UI
  useEffect(() => {
    const { DeviceEventEmitter } = require('react-native');
    const sub = DeviceEventEmitter.addListener('RESET_STATUS_VIEWS', (id: string) => {
      if (id === userId) {
        setViewsCount(0);
      }
    });
    return () => sub.remove();
  }, [userId]);
  console.log(`[useLiveStatusViews] userId: ${userId}, viewsCount: ${viewsCount}`);
  
  return { viewsCount, isLoading };
}
