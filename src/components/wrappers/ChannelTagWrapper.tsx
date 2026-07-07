import React from 'react';
import { createTag } from '@/channel/pages/tag/tagService';
import { useInteractionStore } from '@/core/store/useInteractionStore';

interface ChannelTagWrapperProps {
  postId: string;
  sourceChannelId: string;
  targetChannelId: string;
  linkChain?: string[] | null;
  children: React.ReactElement;
  onTagSuccess?: () => void;
}

export const ChannelTagWrapper: React.FC<ChannelTagWrapperProps> = ({
  postId,
  sourceChannelId,
  targetChannelId,
  linkChain = [],
  children,
  onTagSuccess,
}) => {
  const incrementChannelTagCount = useInteractionStore((s) => s.incrementChannelTagCount);

  const handleTag = async () => {
    try {
      // If sourceChannelId is missing or invalid (e.g. "user_feed" from global feed),
      // we fall back to the targetChannelId to satisfy the database NOT NULL constraint.
      const actualSourceChannelId = (sourceChannelId && sourceChannelId !== 'user_feed') 
        ? sourceChannelId 
        : targetChannelId;

      // 1. Send the tag request to the backend
      await createTag({
        postId,
        sourceChannelId: actualSourceChannelId,
        targetChannelId,
        linkChain: [...(linkChain ?? []), targetChannelId],
      });

      // 2. Optimistically increment the local tag count
      incrementChannelTagCount(postId);

      // 3. Callback to close the overlay/modal or navigate back
      onTagSuccess?.();
    } catch (e) {
      console.error('[ChannelTagWrapper] Failed to tag channel:', e);
    }
  };

  // Clone the child element to inject our handleTag logic into its onPress
  // while preserving any existing onPress behavior if necessary, though 
  // usually it's just the button being pressed.
  return React.cloneElement(children, {
    onPress: (e: any) => {
      handleTag();
      const childProps = children.props as any;
      if (childProps.onPress) {
        childProps.onPress(e);
      }
    },
  });
};
