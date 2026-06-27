import React, { useEffect } from 'react';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { LikeButton } from '@/video/widgets/LikeButton';

interface LikeButtonWrapperProps {
  postId: string;
  sourceTable?: string;
  initialLikesCount?: number;
  initialIsLiked?: boolean;
  boxId?: string;
  onLike?: () => void;
}

export const LikeButtonWrapper: React.FC<LikeButtonWrapperProps> = ({
  postId,
  sourceTable,
  initialLikesCount = 0,
  initialIsLiked = false,
  boxId,
  onLike
}) => {
  const store = useInteractionStore();

  useEffect(() => {
    store.seedPost(postId, initialLikesCount, 0, initialIsLiked, 0, boxId);
  }, [postId, boxId, initialLikesCount, initialIsLiked]);

  const globalKey = boxId ? `${boxId}_${postId}` : postId;
  const globalLiked = useInteractionStore(s => s.likes[globalKey]);
  const globalLikesCount = useInteractionStore(s => s.likesCount[globalKey]);

  const liked = globalLiked !== undefined ? globalLiked : initialIsLiked;
  const likesCount = globalLikesCount !== undefined ? globalLikesCount : initialLikesCount;

  const handleLike = (e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    store.toggleLike(postId, boxId, sourceTable);
    onLike?.();
  };

  return (
    <LikeButton
      initialLikes={likesCount}
      isLiked={liked}
      onTap={handleLike}
    />
  );
};
