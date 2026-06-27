import VisibilityTrackerWrapper from '@/components/cardButton/VisibilityTrackerWrapper';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { useCallback, useEffect } from 'react';

// Track which posts have been viewed in this session so we only increment once per session
const viewedPostsSession = new Set<string>();

interface InteractionState {
  isLiked: boolean;
  likesCount: number;
  viewsCount: number;
  downloadsCount: number;
  isTagged: boolean;
}

interface PostInteractionWrapperProps {
  postId: string;
  initialLikesCount?: number;
  initialViewsCount?: number;
  initialDownloadsCount?: number;
  initialIsLiked?: boolean;

  /**
   * If provided, the wrapper will track if this post is tagged to this specific box.
   */
  boxId?: string;

  /**
   * Identifies if the post is from 'posts' or 'channel_posts' for DB routing.
   */
  sourceTable?: string;

  /**
   * Initial tag state for the specific box.
   */
  initialIsTagged?: boolean;

  /**
   * If provided, overrides the default VisibilityTrackerWrapper logic.
   * Useful when a parent component (like a FlashList) already tracks visibility.
   */
  forceIsVisible?: boolean;

  /**
   * Function that renders the child using the merged interaction state.
   */
  children: (state: InteractionState) => React.ReactNode;
}

export const PostInteractionWrapper: React.FC<PostInteractionWrapperProps> = ({
  postId,
  initialLikesCount = 0,
  initialViewsCount = 0,
  initialDownloadsCount = 0,
  initialIsLiked = false,
  boxId,
  sourceTable,
  initialIsTagged = false,
  forceIsVisible,
  children
}) => {
  const store = useInteractionStore();

  // 1. Seed initial data into store on mount
  useEffect(() => {
    store.seedPost(postId, initialLikesCount, initialViewsCount, initialIsLiked, initialDownloadsCount, boxId);
    if (boxId) {
      store.seedTag(postId, boxId, initialIsTagged);
    }
    // We intentionally only run this once on mount per postId to avoid
    // overwriting optimistic state with stale incoming props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, boxId]);

  const handleVisibilityChanged = useCallback((isVisible: boolean) => {
    if (isVisible) {
      const viewKey = boxId ? `${boxId}_${postId}` : postId;
      if (!viewedPostsSession.has(viewKey)) {
        viewedPostsSession.add(viewKey);

        // Delay slightly to ensure it's actually an intentional view
        setTimeout(() => {
          store.incrementView(postId, boxId, sourceTable);
        }, 1000);
      }
    }
  }, [postId, boxId, sourceTable, store]);

  // Use explicit prop if provided
  useEffect(() => {
    if (forceIsVisible) {
      handleVisibilityChanged(true);
    }
  }, [forceIsVisible, handleVisibilityChanged]);

  // 2. Select the current state from the store based on context key
  const contextKey = boxId ? `${boxId}_${postId}` : postId;

  const globalLiked = store.likes[postId] ?? initialIsLiked;
  const boxLiked = boxId ? (store.likes[contextKey] ?? false) : false;
  const isLiked = globalLiked || boxLiked;

  const likesCount = store.likesCount[contextKey] ?? initialLikesCount;
  const viewsCount = store.viewsCount[contextKey] ?? initialViewsCount;
  const downloadsCount = store.downloadsCount[contextKey] ?? initialDownloadsCount;

  const isTagged = boxId
    ? (store.tags[postId]?.includes(boxId) ?? initialIsTagged)
    : false;

  const renderedChildren = children({ isLiked, likesCount, viewsCount, downloadsCount, isTagged });

  // 3. Render child
  if (forceIsVisible !== undefined) {
    return <>{renderedChildren}</>;
  }

  return (
    <VisibilityTrackerWrapper onVisibilityChanged={handleVisibilityChanged}>
      {renderedChildren}
    </VisibilityTrackerWrapper>
  );
};
