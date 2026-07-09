import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { useDesktopChannelModalStore } from '@/core/store/useDesktopChannelModalStore';
import { useRouter } from 'expo-router';
import { Eye, Tag } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

import { LikeAction } from '@/channel/CRimChartMassageBubble/comment_action/like/LikeAction';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';
import { TagOverlay } from '@/channel/pages/tag/TagOverlay';
import { PostHeader } from '@/components/PostHeader/PostHeader';
import { PostOptionsSheet } from '@/components/postOptionsSheet/PostOptionsSheet';
import { useFeedPermissions } from '@/components/wrappers/FeedPermissionsWrapper';
import { ChannelAudioPostWidget } from './postCardFiles/ChannelAudioPostWidget';
import { ChannelImagePostWidget } from './postCardFiles/ChannelImagePostWidget';
import { PostContent } from './postCardFiles/PostContent';

export interface RegularPostCardProps {
  channelId?: string | null;
  author: CrimChartUserModel;
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
  viewsCount?: number;
  downloadsCount?: number;
  isLiked?: boolean;
  postId?: string | null;
  onTagTap?: () => void;
  thumbnailUrl?: string | null;
  metadata?: any;
  isActive?: boolean;
  widgetType?: string | null;
  source_type?: string | null;
  canComment?: boolean;
  channelAvatarUrl?: string | null;
  channelName?: string | null;
  onLikeTap?: () => void;
}

export const RegularPostCard: React.FC<RegularPostCardProps> = ({
  author,
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
  viewsCount = 0,
  downloadsCount = 0,
  isLiked = false,
  postId,
  onTagTap,
  thumbnailUrl,
  metadata,
  isActive = false,
  widgetType,
  source_type,
  channelId,
  canComment: canCommentProp = true,
  channelAvatarUrl,
  channelName,
  onLikeTap,
}) => {
  const { canComment: contextCanComment } = useFeedPermissions();
  const canComment = canCommentProp && contextCanComment;
  const router = useRouter();
  const [tagOverlayVisible, setTagOverlayVisible] = useState(false);
  const [postOptionsVisible, setPostOptionsVisible] = useState(false);
  const [postOptionsPosition, setPostOptionsPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();

  const allImages = React.useMemo(() => {
    const imgs: string[] = [];
    if (imageUrl) imgs.push(imageUrl);
    if (imageUrls) imgs.push(...imageUrls);
    return Array.from(new Set(imgs));
  }, [imageUrl, imageUrls]);

  const goToProfile = () => {
    console.log('[RegularPostCard] Tapped avatar. author.id:', author?.id);
    if (author?.id) {
      router.push(`/profile/${author.id}`);
    }
  };

  const isPersonalPost = widgetType === 'regular_post';

  return (
    <View style={styles.container}>
      {/* Header */}
      <PostHeader
        author={author}
        source_type={source_type}
        timeAgo={timeAgo}
        onAvatarTap={goToProfile}
        onMoreTap={(e: any) => {
          if (Platform.OS === 'web' && e?.nativeEvent) {
            setPostOptionsPosition({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
          }
          setPostOptionsVisible(true);
        }}
        channelId={channelId}
        channelAvatarUrl={channelAvatarUrl}
        channelName={channelName}
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

      {/* Content */}
      <PostContent content={content} />

      {/* Media */}
      {audioUrl ? (
        <ChannelAudioPostWidget audioUrl={audioUrl} thumbnailUrl={thumbnailUrl ?? undefined} metadata={metadata} isActive={isActive} downloadsCount={downloadsCount} postId={postId ?? undefined} sourceTable={widgetType === 'channel_post' ? 'channel_posts' : 'posts'} />
      ) : allImages.length > 0 ? (
        <ChannelImagePostWidget images={allImages} />
      ) : null}
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
        <View style={{ flex: 1 }} />
        <View style={styles.actionsRight}>
          <LikeAction initialLikesCount={likesCount} initialIsLiked={isLiked} onLikeTap={onLikeTap} />
          <View style={{ width: 16 }} />
          {canComment ? (
            <CommentActionWidget commentsCount={commentsCount} postId={postId || ''} />
          ) : (
            <View style={{ opacity: 0.3 }} pointerEvents="none">
              <CommentActionWidget commentsCount={commentsCount} postId={postId || ''} />
            </View>
          )}
          <View style={{ width: 16 }} />
          <TouchableOpacity activeOpacity={1}
            style={styles.actionButton}
            onPress={() => {
              if (onTagTap) { onTagTap(); } else { setTagOverlayVisible(true); }
            }}
          >
            <Tag size={24} color={theme.colors.text} />
            <Text style={styles.actionText}>{tagsCount}</Text>
          </TouchableOpacity>
          <View style={{ width: 16 }} />
          <View style={styles.actionButton}>
            <Eye size={24} color={theme.colors.text} />
            <Text style={styles.actionText}>{viewsCount ?? 0}</Text>
          </View>
        </View>
      </View>

      <TagOverlay
        visible={tagOverlayVisible}
        onClose={() => setTagOverlayVisible(false)}
        postId={postId ?? ''}
        sourceChannelId={channelId ?? ''}
        linkChain={[]}
      />

      <PostOptionsSheet
        postId={postId ?? ''}
        visible={postOptionsVisible}
        onClose={() => setPostOptionsVisible(false)}
        anchorPosition={postOptionsPosition}
      />
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => ({
  container: {
    paddingVertical: 12 * scale,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  footer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16 * scale,
    paddingTop: 12 * scale,
  },
  actionsRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6 * scale,
  },
  actionText: {
    color: colors.text,
    fontSize: 14 * scale,
    fontWeight: '800' as const,
  },
  timeAgo: {
    color: colors.textSecondary,
    fontSize: 13 * scale,
    fontWeight: '600' as const,
  },
});
