import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { MoreHorizontal, Tag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

import { LikeAction } from '@/channel/CRimChartMassageBubble/comment_action/like/LikeAction';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';
import { TagOverlay } from '@/channel/pages/tag/TagOverlay';
import { AvatarWithStatus } from './postCardFiles/AvatarWithStatus';
import { useFeedPermissions } from '@/components/wrappers/FeedPermissionsWrapper';
import { ChannelAudioPostWidget } from './postCardFiles/ChannelAudioPostWidget';
import { ChannelImagePostWidget } from './postCardFiles/ChannelImagePostWidget';
import { ChannelVideoPostWidget } from './postCardFiles/ChannelVideoPostWidget';
import { PostContent } from './postCardFiles/PostContent';
import { TaggerRow } from './postCardFiles/TaggerRow';

export interface ChannelPostCardProps {
  authorData: CrimChartUserModel;
  content: string;
  timeAgo: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  aspectRatio?: number | null;
  likesCount?: number;
  commentsCount?: number;
  tagsCount?: number;
  isLiked?: boolean;
  postId?: string | null;
  onLikeTap?: () => void;
  onTagTap?: () => void;
  channelId?: string | null;
  channelName?: string | null;
  currentChannelAvatar?: string | null;
  sourceChannelName?: string | null;
  sourceChannelAvatar?: string | null;
  taggerName?: string | null;
  taggerAvatar?: string | null;
  showCreatorBadge?: boolean;
  thumbnailUrl?: string | null;
  metadata?: any;
  canComment?: boolean;
}

export const ChannelPostCard: React.FC<ChannelPostCardProps> = ({
  authorData: author,
  content,
  timeAgo,
  imageUrl,
  imageUrls,
  videoUrl,
  audioUrl,
  aspectRatio,
  likesCount = 0,
  commentsCount = 0,
  tagsCount = 0,
  isLiked = false,
  postId,
  onLikeTap,
  onTagTap,
  canComment: canCommentProp = true,
  channelId,
  channelName,
  currentChannelAvatar,
  sourceChannelName,
  sourceChannelAvatar,
  taggerName,
  taggerAvatar,
  showCreatorBadge,
  thumbnailUrl,
  metadata,
}) => {
  const { canComment: contextCanComment } = useFeedPermissions();
  const canComment = canCommentProp && contextCanComment;
  const router = useRouter();
  const [tagOverlayVisible, setTagOverlayVisible] = useState(false);
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();

  const allImages = React.useMemo(() => {
    const imgs: string[] = [];
    if (imageUrl) imgs.push(imageUrl);
    if (imageUrls) imgs.push(...imageUrls);
    return Array.from(new Set(imgs));
  }, [imageUrl, imageUrls]);

  const hasChannel = Boolean(channelId);

  const goToProfile = () => {
    console.log('[ChannelPostCard] Tapped avatar. author.id:', author?.id);
    if (author?.id) {
      router.push(`/profile/${author.id}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {hasChannel && (
          <AvatarWithStatus
            channelId={channelId}
            currentChannelAvatar={currentChannelAvatar}
            sourceChannelAvatar={sourceChannelAvatar}
            authorAvatar={author.profileImageUrl}
            onTap={goToProfile}
          />
        )}
        <View style={styles.authorInfoContainer}>
          <Text style={styles.displayName} numberOfLines={1}>
            {author.displayName || 'Unknown User'}
          </Text>
          {sourceChannelName ? (
            <Text style={styles.taggedText}>
              Tagged from {sourceChannelName}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity activeOpacity={1} style={styles.moreButton}>
          <MoreHorizontal color={theme.colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <PostContent content={content} />

      {/* Media */}
      {audioUrl ? (
        <ChannelAudioPostWidget audioUrl={audioUrl} thumbnailUrl={thumbnailUrl ?? undefined} metadata={metadata} />
      ) : videoUrl ? (
        <ChannelVideoPostWidget videoUrl={videoUrl} aspectRatio={aspectRatio} thumbnail={thumbnailUrl} />
      ) : allImages.length > 0 ? (
        <ChannelImagePostWidget images={allImages} />
      ) : null}

      {/* Tagger Row */}
      <TaggerRow taggerName={taggerName} taggerAvatar={taggerAvatar} tagsCount={tagsCount} />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
        <View style={{ flex: 1 }} />

        <LikeAction initialLikesCount={likesCount} initialIsLiked={isLiked} onLikeTap={onLikeTap} />
        
        {canComment ? (
          <CommentActionWidget commentsCount={commentsCount} postId={postId || ''} />
        ) : (
          <View style={{ opacity: 0.3 }} pointerEvents="none">
            <CommentActionWidget commentsCount={commentsCount} postId={postId || ''} />
          </View>
        )}

        <TouchableOpacity activeOpacity={1}
          style={[styles.actionButton, { marginLeft: 24 }]}
          onPress={() => {
            if (onTagTap) { onTagTap(); } else { setTagOverlayVisible(true); }
          }}
        >
          <Tag size={24} color={theme.colors.text} />
          <Text style={styles.actionText}>{tagsCount}</Text>
        </TouchableOpacity>
      </View>

      <TagOverlay
        visible={tagOverlayVisible}
        onClose={() => setTagOverlayVisible(false)}
        postId={postId ?? ''}
        sourceChannelId={channelId ?? ''}
        linkChain={[]}
        channelName={channelName}
      />
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => ({
  container: {
    paddingVertical: 6 * scale,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16 * scale,
    marginBottom: 12 * scale,
  },
  authorInfoContainer: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  displayName: {
    color: colors.text,
    fontSize: 15 * scale,
    fontWeight: '700' as const,
  },
  taggedText: {
    color: colors.textSecondary,
    fontSize: 11 * scale,
    fontWeight: '600' as const,
  },
  moreButton: {
    padding: 4 * scale,
  },
  footer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16 * scale,
    paddingTop: 8 * scale,
    paddingBottom: 8 * scale,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6 * scale,
  },
  actionText: {
    color: colors.text,
    fontSize: 14 * scale,
    fontWeight: '900' as const,
  },
  timeAgo: {
    color: colors.textSecondary,
    fontSize: 13 * scale,
    fontWeight: '500' as const,
  },
});
