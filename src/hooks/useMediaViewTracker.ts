import { useEffect, useRef } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';

import { useViewedStatusStore } from '@/core/store/useViewedStatusStore';

interface UseMediaViewTrackerProps {
  mediaId: string | undefined | null;
  tableName: string;
  idColumn: string;
  authorId?: string; // Add authorId to target the broadcast
}

export const useMediaViewTracker = ({ mediaId, tableName, idColumn, authorId }: UseMediaViewTrackerProps) => {
  const viewedItems = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!mediaId || viewedItems.current.has(mediaId)) return;

    const trackView = async () => {
      try {
        viewedItems.current.add(mediaId);
        
        // Mark locally immediately for instant UI update
        if (tableName === 'status_views') {
          useViewedStatusStore.getState().markViewed(mediaId);
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Prevent authors from logging views on their own content in the database
        if (authorId && user.id === authorId) return;

        const { error } = await supabase
          .from(tableName)
          .insert({
            [idColumn]: mediaId,
            viewer_id: user.id,
          });

        if (!error && authorId) {
          // Send ephemeral broadcast directly to the author, bypassing postgres_changes
          supabase.channel(`profile-views-${authorId}`).send({
            type: 'broadcast',
            event: 'new_status_view',
            payload: { mediaId, viewerId: user.id },
          });
        }

        if (error && error.code !== '23505') {
          console.error(`Error tracking view in ${tableName}:`, error);
          viewedItems.current.delete(mediaId);
        }
      } catch (err) {
        console.error('Exception in view tracker:', err);
        viewedItems.current.delete(mediaId);
      }
    };

    trackView();
  }, [mediaId, tableName, idColumn, authorId]);
};
