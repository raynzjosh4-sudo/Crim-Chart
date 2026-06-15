import { supabase } from '@/core/supabase/client';
import { useCallback } from 'react';

export type InteractionType = 
  | 'view' 
  | 'post' 
  | 'react' 
  | 'like'
  | 'dislike'
  | 'comment' 
  | 'share' 
  | 'download' 
  | 'tag';

export const useBoxInteractionTracker = () => {
  const trackInteraction = useCallback(async (boxId: string, userId: string, type: InteractionType) => {
    if (!boxId || !userId) return;

    try {
      // Using the RPC function for a clean upsert
      const { error } = await supabase.rpc('track_box_interaction', {
        p_box_id: boxId,
        p_user_id: userId,
        p_interaction_type: type,
      });

      if (error) {
        // Fallback to direct table upsert if RPC is not available
        console.warn('RPC failed or not available, falling back to direct upsert', error);
        
        await supabase
          .from('box_members')
          .upsert({
            box_id: boxId,
            user_id: userId,
            interaction_type: type,
            last_interaction_at: new Date().toISOString(),
          }, {
            onConflict: 'box_id,user_id'
          });
      }
    } catch (err) {
      console.error('Error tracking box interaction:', err);
    }
  }, []);

  return { trackInteraction };
};
