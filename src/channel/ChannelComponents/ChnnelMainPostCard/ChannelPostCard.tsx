import { useStyles } from '@/core/hooks/useStyles';
import { useDesktopChannelModalStore } from '@/core/store/useDesktopChannelModalStore';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { useRouter } from 'expo-router';
import { Tag } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

import { LikeAction } from '@/channel/CRimChartMassageBubble/comment_action/like/LikeAction';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';
import { TagOverlay } from '@/channel/pages/tag/TagOverlay';
import { PostHeader } from '@/components/PostHeader/PostHeader';
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
  downloadsCount?: number;
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
  source_type?: string | null;
  channelDescription?: string | null;
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
  downloadsCount = 0,
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
  source_type,
  channelDescription,
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
      {taggerName ? (
        <View>
          <PostHeader
            author={{
              id: '',
              displayName: taggerName,
              username: taggerName,
              profileImageUrl: taggerAvatar || '',
              isActive: false,
              hasStatus: false,
              statusCount: 0,
            } as any}
            source_type={source_type}
            timeAgo={timeAgo}
            onAvatarTap={() => {}}
            onMoreTap={() => { }}
            channelId={channelId}
            channelAvatarUrl={currentChannelAvatar || sourceChannelAvatar}
            channelName={channelName}
            channelDescription={channelDescription}
            onChannelAvatarTap={() => {
              if (channelId) {
                if (Platform.OS === 'web' && window.innerWidth >= 768) {
                  useDesktopChannelModalStore.getState().openChannel(channelId);
                } else {
                  router.push({ pathname: '/channel/channelpage', params: { id: channelId } } as any);
                }
              }
            }}
          />
          <View style={{ marginLeft: 32, paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)', marginTop: 4 }}>
            <PostHeader
              author={author}
              source_type="repost"
              timeAgo={timeAgo}
              onAvatarTap={goToProfile}
              onMoreTap={() => { }}
            />
          </View>
        </View>
      ) : (
        <PostHeader
          author={author}
          source_type={source_type}
          timeAgo={timeAgo}
          onAvatarTap={goToProfile}
          onMoreTap={() => { }} // TODO: add more options
          channelId={channelId}
          channelAvatarUrl={currentChannelAvatar || sourceChannelAvatar}
          channelName={channelName}
          channelDescription={channelDescription}
          onChannelAvatarTap={() => {
            if (channelId) {
              if (Platform.OS === 'web' && window.innerWidth >= 768) {
                useDesktopChannelModalStore.getState().openChannel(channelId);
              } else {
                router.push({ pathname: '/channel/channelpage', params: { id: channelId } } as any);
              }
            }
          }}
        />
      )}

      {/* Content */}
      <PostContent content={content} />

      {/* Media */}
      {audioUrl ? (
        <ChannelAudioPostWidget audioUrl={audioUrl} thumbnailUrl={thumbnailUrl ?? undefined} metadata={metadata} downloadsCount={downloadsCount} postId={postId ?? undefined} sourceTable="channel_posts" />
      ) : videoUrl ? (
        <ChannelVideoPostWidget videoUrl={videoUrl} aspectRatio={aspectRatio} thumbnail={thumbnailUrl} />
      ) : allImages.length > 0 ? (
        <ChannelImagePostWidget images={allImages} />
      ) : null}

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
  userAvatarContainer: {
    marginRight: 12 * scale,
  },
  channelAvatarContainer: {
    marginLeft: 8 * scale,
  },
  channelAvatar: {
    width: 32 * scale,
    height: 32 * scale,
    borderRadius: 16 * scale,
    backgroundColor: colors.surfaceVariant,
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
