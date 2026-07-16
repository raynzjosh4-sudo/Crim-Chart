import React from 'react';
import { createUserTag } from '@/channel/pages/tag/tagService';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { Alert } from 'react-native';

interface UserTagWrapperProps {
  postId: string;
  targetUserId: string;
  children: React.ReactElement;
  onTagSuccess?: () => void;
  onAlreadyTagged?: () => void;
  sourceTable?: string;
}

export const UserTagWrapper: React.FC<UserTagWrapperProps> = ({
  postId,
  targetUserId,
  children,
  onTagSuccess,
  onAlreadyTagged,
  sourceTable = 'posts',
}) => {
  const incrementChannelTagCount = useInteractionStore((s) => s.incrementChannelTagCount);
  const { startLoading, stopLoading } = useGlobalProgress();

  const handleTag = async () => {
    try {
      startLoading();
      await createUserTag({ postId, targetUserId, sourceTable });
      incrementChannelTagCount(postId);
      onTagSuccess?.();
    } catch (e: any) {
      if (e?.code === '23505') {
        onAlreadyTagged?.();
        return;
      }
      console.error('[UserTagWrapper] Failed to tag user:', e);
      Alert.alert("Tagging Failed", "Failed to tag user. Please try again.");
    } finally {
      stopLoading();
    }
  };

  return React.cloneElement(children, {
    onPress: (e: any) => {
      handleTag();
      const childProps = children.props as any;
      if (childProps.onPress) childProps.onPress(e);
    },
  });
};
