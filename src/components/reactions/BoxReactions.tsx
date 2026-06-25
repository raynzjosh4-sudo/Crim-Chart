import { supabase } from '@/core/supabase/client';
import { InteractionType } from '@/features/boxes/application/useBoxInteractionTracker';
import { LikeAction } from '@/features/feed/components/LikeAction';
import { ThumbsDown, ThumbsUp } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export interface BoxReactionsProps {
  boxItemId: string;
  postId?: string;
  boxId?: string;
  initialLikes: number;
  initialDislikes: number;
  initialIsLiked?: boolean;
  initialIsDisliked?: boolean;
  currentUserId?: string;
  onInteraction?: (boxId: string, userId: string, type: InteractionType) => void;
}

export const BoxReactions = ({
  boxItemId,
  postId,
  boxId,
  initialLikes,
  initialDislikes,
  initialIsLiked,
  initialIsDisliked,
  currentUserId,
  onInteraction
}: BoxReactionsProps) => {
  const [localIsLiked, setLocalIsLiked] = useState(initialIsLiked || false);
  const [localIsDisliked, setLocalIsDisliked] = useState(initialIsDisliked || false);
  const [localLikes, setLocalLikes] = useState(initialLikes || 0);
  const [localDislikes, setLocalDislikes] = useState(initialDislikes || 0);

  useEffect(() => {
    let isMounted = true;
    const checkReactions = async () => {
      if (!currentUserId) return;

      let foundLike = false;
      let foundDislike = false;

      // Check Like and Global Likes Count
      if (postId) {
        // We can query both the user's like and the total likes count
        const { data: likeData } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', currentUserId)
          .maybeSingle();
        
        if (isMounted && likeData) {
          setLocalIsLiked(true);
          foundLike = true;
        }

        const { data: postData } = await supabase
          .from('posts')
          .select('likes_count')
          .eq('id', postId)
          .maybeSingle();

        if (isMounted && postData && postData.likes_count !== null) {
          setLocalLikes(postData.likes_count);
        }
      }

      // Check Dislike
      const { data: dislikeData } = await supabase
        .from('box_item_reactions')
        .select('id')
        .eq('box_item_id', boxItemId)
        .eq('user_id', currentUserId)
        .eq('reaction_type', 'dislike')
        .maybeSingle();

      if (isMounted && dislikeData) {
        setLocalIsDisliked(true);
        foundDislike = true;
      }

      // Cleanup conflicting state if user tested earlier when mutually exclusive wasn't enforced
      if (foundLike && foundDislike && isMounted) {
        setLocalIsDisliked(false);
        await supabase.from('box_item_reactions').delete()
          .eq('box_item_id', boxItemId)
          .eq('user_id', currentUserId)
          .eq('reaction_type', 'dislike');
      }
    };

    checkReactions();
    return () => { isMounted = false; };
  }, [boxItemId, postId, currentUserId]);

  const toggleLikeInDB = async () => {
    if (!postId) return;
    try {
      await supabase.rpc('toggle_like', { p_post_id: postId });
    } catch (err) {
      console.error('Failed to toggle like', err);
    }
  };

  const toggleDislikeInDB = async (isDisliking: boolean) => {
    if (!currentUserId || !boxId) return;
    try {
      if (isDisliking) {
        await supabase.from('box_item_reactions').insert({
          box_item_id: boxItemId,
          user_id: currentUserId,
          reaction_type: 'dislike'
        });
      } else {
        await supabase.from('box_item_reactions').delete()
          .eq('box_item_id', boxItemId)
          .eq('user_id', currentUserId)
          .eq('reaction_type', 'dislike');
      }
    } catch (err) {
      console.error('Failed to toggle dislike', err);
    }
  };

  const handleLike = async (newLiked: boolean) => {
    if (!currentUserId || !boxId) return;

    setLocalIsLiked(newLiked);
    setLocalLikes(newLiked ? localLikes + 1 : Math.max(0, localLikes - 1));

    if (newLiked && localIsDisliked) {
      setLocalIsDisliked(false);
      setLocalDislikes(Math.max(0, localDislikes - 1));
      await toggleDislikeInDB(false);
    }

    if (onInteraction && newLiked) {
      onInteraction(boxId, currentUserId, 'like');
    }

    await toggleLikeInDB();
  };

  const handleDislike = async (newDisliked: boolean) => {
    if (!currentUserId || !boxId) return;

    setLocalIsDisliked(newDisliked);
    setLocalDislikes(newDisliked ? localDislikes + 1 : Math.max(0, localDislikes - 1));

    if (newDisliked && localIsLiked) {
      setLocalIsLiked(false);
      setLocalLikes(Math.max(0, localLikes - 1));
      await toggleLikeInDB();
    }

    if (onInteraction && newDisliked) {
      onInteraction(boxId, currentUserId, 'dislike');
    }

    await toggleDislikeInDB(newDisliked);
  };

  return (
    <View style={styles.reactionsContainer}>
      <View style={styles.actionBtn}>
        <LikeAction
          initialLikes={localLikes}
          initialIsLiked={localIsLiked}
          onPress={handleLike}
          size={24}
          direction="row"
          icon={ThumbsUp}
        />
      </View>

      <View style={styles.actionBtn}>
        <LikeAction
          initialLikes={localDislikes}
          initialIsLiked={localIsDisliked}
          onPress={handleDislike}
          size={24}
          direction="row"
          icon={ThumbsDown}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
});
