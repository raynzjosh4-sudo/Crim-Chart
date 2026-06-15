import React from 'react';
import { supabase } from '@/core/supabase/client';

interface BoxReactionRecorderWrapperProps {
  postId: string;
  boxId?: string;
  reactionType: string;
  children: (props: { recordReaction: () => Promise<void> }) => React.ReactNode;
}

/**
 * A wrapper that takes an interaction type and silently records it 
 * to the `box_item_reactions` table in the database after the child completes its action.
 */
export const BoxReactionRecorderWrapper: React.FC<BoxReactionRecorderWrapperProps> = ({
  postId,
  boxId,
  reactionType,
  children
}) => {

  const recordReaction = async () => {
    if (!boxId) return; // Can't record a box item reaction without a box context

    try {
      console.log(`\n==========================================`);
      console.log(`🔔 [BoxReactionRecorder] Recording '${reactionType}' for post ${postId} in box ${boxId}`);
      console.log(`==========================================\n`);
      const { data, error } = await supabase.rpc('record_box_item_reaction', {
        p_post_id: postId,
        p_box_id: boxId,
        p_reaction_type: reactionType
      });

      if (error) {
        console.error('[BoxReactionRecorder] Supabase error:', error);
      } else if (data && !data.success) {
        console.error('[BoxReactionRecorder] RPC returned error:', data.error);
      } else {
        console.log(`✅ [BoxReactionRecorder] Successfully recorded '${reactionType}'!`);
      }
    } catch (e) {
      console.error('[BoxReactionRecorder] Exception during recordReaction:', e);
    }
  };

  return <>{children({ recordReaction })}</>;
};
