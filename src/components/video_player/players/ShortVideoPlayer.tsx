import UserAvatar from '@/components/avatar/UserAvatar';
import { AnimatedPostButton } from '@/components/buttons/AnimatedPostButton';
import { CommentSheet } from '@/components/comments/CommentSheet';
import { PostFooter } from '@/components/PostFooter/PostFooter';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Check, Play, Tag, Volume2, VolumeX, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { ShortVideoPlayerCard } from '../ShortVideoPlayerCard';

import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useDesktopVidsStore } from '@/mainFeed/pages/main_page_widgets/useDesktopVidsStore';
import { PreloadableVideoPlayer, PreloadStatus } from '@/video/components/PreloadableVideoPlayer';

export interface ShortVideoPlayerProps {
  video: {
    id: string;
    title: string;
    director: string;
    thumbnailUrl: string;
    duration: string;
    description?: string;
    likes: number;
    dislikes: number;
    commentsCount?: number;
    viewsCount?: number;
    tagsCount?: number;
    createdAt?: string;
    videoUrl?: string;
    sourceTable?: string;
    source_type?: string;
    addedBy?: {
      id: string;
      name: string;
      avatarUrl: string;
    };
    linkedFrom?: {
      id: string;
      avatarUrl: string;
      name: string;
    };
  };
  onAddPress?: (editedTitle?: string) => void | Promise<void>;
  onTagPress?: () => void;
  onLikePress?: () => void;
  onVideoPress?: (params: any) => void;
  isAdded?: boolean;
  isLiked?: boolean;
  preloadStatus?: PreloadStatus;
  disableVideoPlayer?: boolean;
}

import { TagOverlay } from '@/channel/pages/tag/TagOverlay';

export const ShortVideoPlayer = ({ video, onAddPress, onTagPress, onLikePress, onVideoPress, isAdded, isLiked, preloadStatus = 'idle', disableVideoPlayer }: ShortVideoPlayerProps) => {
  const router = useRouter();
  const [showPlayer, setShowPlayer] = useState(false);
  const isMuted = useDesktopVidsStore(state => state.isGlobalMuted);
  const setIsMuted = useDesktopVidsStore(state => state.setGlobalIsMuted);
  const setActiveVideo = useDesktopVidsStore(state => state.setActiveVideo);
  const [isCommentSheetVisible, setIsCommentSheetVisible] = useState(false);
  const [tagOverlayVisible, setTagOverlayVisible] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(Number(video.commentsCount) || 0);
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { startLoading, stopLoading } = useGlobalProgress();

  useEffect(() => {
    setLocalCommentsCount(Number(video.commentsCount) || 0);
  }, [video.commentsCount]);

  const isLocal = video.addedBy?.id === 'local_user';

  const realName = isLocal ? 'You' : (video.addedBy?.name || 'Unknown User');

  const [localTitle, setLocalTitle] = useState(video.title || '');

  const videoToPlay = video.videoUrl || '';

  return (
    <View style={styles.container}>

      <View style={styles.videoInfo}>
        {isLocal ? (
          <TextInput
            style={[styles.videoTitle, styles.inputField]}
            value={localTitle}
            onChangeText={setLocalTitle}
            placeholder="Caption"
            placeholderTextColor={theme.colors.textSecondary}
          />
        ) : (
          <Text style={styles.videoTitle}>{video.title}</Text>
        )}
      </View>

      {/* Cinematic Video Header */}
      {isDesktop ? (
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.thumbnailContainer,
            {
              height: 600,
              backgroundColor: theme.colors.background,
            }
          ]}
          onPress={() => setIsMuted(!isMuted)}
        >
          <View style={[
            StyleSheet.absoluteFillObject,
            { alignItems: 'center', justifyContent: 'center' }
          ]}>
            <View style={{ width: 337.5, height: '100%', borderRadius: 12, overflow: 'hidden' }}>
              <Image
                source={video.thumbnailUrl ? { uri: video.thumbnailUrl } : undefined}
                style={styles.videoThumbnail as any}
                contentFit="cover"
              />
              {!disableVideoPlayer && preloadStatus !== 'idle' && (
                <PreloadableVideoPlayer
                  videoUrl={videoToPlay as string}
                  preloadStatus={preloadStatus}
                  isMuted={isMuted}
                  style={styles.videoThumbnail as any}
                  contentFit="contain"
                  isDesktop={isDesktop}
                />
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.durationBadge}
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
          >
            {isMuted ? (
              <VolumeX size={16} color={theme.colors.text} />
            ) : (
              <Volume2 size={16} color={theme.colors.text} />
            )}
          </TouchableOpacity>
          {video.linkedFrom && (
            <View style={styles.linkedFromBadge}>
              <UserAvatar
                userId={video.linkedFrom.id || ''}
                fallbackUrl={video.linkedFrom.avatarUrl}
                name={video.linkedFrom.name}
                size={44}
              />
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.thumbnailContainer,
            { aspectRatio: 9 / 16 }
          ]}
          activeOpacity={0.8}
          onPress={() => {
            setIsMuted(!isMuted);
          }}
          onLongPress={() => {
            setActiveVideo(video.id);
            router.push('/vids');
          }}
        >
          <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
            <View style={{ width: '100%', height: '100%' }}>
              <Image
                source={video.thumbnailUrl ? { uri: video.thumbnailUrl } : undefined}
                style={styles.videoThumbnail as any}
                contentFit="cover"
              />
              {!disableVideoPlayer && preloadStatus !== 'idle' && (
                <PreloadableVideoPlayer
                  videoUrl={videoToPlay as string}
                  preloadStatus={preloadStatus}
                  isMuted={isMuted}
                  style={styles.videoThumbnail as any}
                  contentFit="cover"
                />
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.durationBadge}
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
          >
            {isMuted ? (
              <VolumeX size={16} color={theme.colors.text} />
            ) : (
              <Volume2 size={16} color={theme.colors.text} />
            )}
          </TouchableOpacity>
          <View style={styles.playOverlay}>
            <Play size={24} color={theme.colors.text} fill={theme.colors.text} />
          </View>
          {video.linkedFrom && (
            <View style={styles.linkedFromBadge}>
              <UserAvatar
                userId={video.linkedFrom.id || ''}
                fallbackUrl={video.linkedFrom.avatarUrl}
                name={video.linkedFrom.name}
                size={44}
              />
            </View>
          )}
        </TouchableOpacity>
      )}




      {/* Bottom Action Bar */}
      <PostFooter
        isLocal={isLocal}
        likesCount={video.likes > 0 ? video.likes : 0}
        isLiked={isLiked || false}
        onLikePress={onLikePress}
        commentsCount={localCommentsCount}
        onCommentPress={() => {
          startLoading();
          setTimeout(() => {
            stopLoading();
            setIsCommentSheetVisible(true);
          }, 400);
        }}
        viewsCount={video.viewsCount || 0}
        iconSize={20}
        rightContent={
          isLocal ? (
            <AnimatedPostButton
              title="Post"
              style={styles.tagButton}
              textStyle={styles.tagButtonText}
              onPress={async () => {
                if (onAddPress) {
                  await onAddPress(localTitle);
                }
              }}
            />
          ) : onTagPress ? (
            <TouchableOpacity activeOpacity={1}
              style={[styles.tagButton, isAdded && styles.tagButtonAdded]}
              onPress={onTagPress}
            >
              {isAdded ? (
                <>
                  <Check size={12} color={theme.colors.background} style={{ marginRight: 6 }} />
                  <Text style={[styles.tagButtonText, { color: theme.colors.background }]}>Tagged</Text>
                </>
              ) : (
                <>
                  <Tag size={12} color={theme.colors.text} style={{ marginRight: 6 }} />
                  <Text style={styles.tagButtonText}>Tag</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity activeOpacity={1} onPress={() => setTagOverlayVisible(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Tag size={20} color={theme.colors.text} />
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginLeft: 6 }}>{video.tagsCount || 0}</Text>
            </TouchableOpacity>
          )
        }
        style={styles.actionBar}
      />

      <Modal visible={showPlayer} animationType="slide" onRequestClose={() => setShowPlayer(false)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <ShortVideoPlayerCard
            video={{
              id: video.id,
              videoUrl: (videoToPlay as string) || '',
              caption: isLocal ? localTitle : video.title,
              authorName: realName,
              directorAvatarUrl: video.addedBy?.avatarUrl || '',
              likesCount: video.likes || 0,
              isLiked: isLiked || false,
              commentsCount: localCommentsCount,
              viewsCount: video.viewsCount || 0,
              tagsCount: video.tagsCount || 0,
              sourceTable: video.sourceTable,
            } as any}
            isPlaying={true}
            onLike={isLocal ? undefined : onLikePress}
            onComment={() => {
              setShowPlayer(false);
              setTimeout(() => setIsCommentSheetVisible(true), 300);
            }}
          />
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}
            onPress={() => setShowPlayer(false)}
          >
            <X color="#FFF" size={24} />
          </TouchableOpacity>
        </View>
      </Modal>

      <CommentSheet
        postId={video.id}
        visible={isCommentSheetVisible}
        onClose={() => setIsCommentSheetVisible(false)}
        onCommentAdded={() => {
          setLocalCommentsCount(Number(localCommentsCount) + 1);
        }}
      />
      <TagOverlay
        visible={tagOverlayVisible}
        onClose={() => setTagOverlayVisible(false)}
        postId={video.id ?? ''}
        sourceChannelId={video.sourceTable === 'channel_posts' ? (video as any).channelId ?? '' : ''}
        linkChain={[]}
      />
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  container: {
    marginBottom: 24 * scale,
    backgroundColor: colors.background,
  },
  thumbnailContainer: {
    width: '100%',
    overflow: 'hidden' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    position: 'relative' as const,
    marginBottom: 8 * scale,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    position: 'absolute' as const,
  },
  durationBadge: {
    position: 'absolute' as const,
    bottom: 8 * scale,
    right: 8 * scale,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6 * scale,
    paddingVertical: 4 * scale,
    borderRadius: 6 * scale,
  },
  durationText: {
    color: colors.text,
    fontSize: 12 * scale,
    fontWeight: '700' as const,
  },
  playOverlay: {
    width: 60 * scale,
    height: 60 * scale,
    borderRadius: 30 * scale,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  postHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 12 * scale,
    paddingHorizontal: 16 * scale,
  },
  headerLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  postHeaderText: {
    marginLeft: 10 * scale,
    justifyContent: 'center' as const,
  },
  postHeaderName: {
    color: colors.text,
    fontSize: 14 * scale,
    fontWeight: '700' as const,
  },
  postHeaderSub: {
    color: colors.textSecondary,
    fontSize: 12 * scale,
    marginTop: 2 * scale,
  },
  followBtn: {
    marginLeft: 12 * scale,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12 * scale,
    paddingVertical: 6 * scale,
    borderRadius: 14 * scale,
  },
  followBtnText: {
    color: colors.text,
    fontSize: 12 * scale,
    fontWeight: '700' as const,
  },
  tagButton: {
    alignSelf: 'center' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12 * scale,
    paddingVertical: 4 * scale,
    borderRadius: 14 * scale,
    backgroundColor: colors.surfaceVariant,
  },
  tagButtonAdded: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  tagButtonText: {
    color: colors.text,
    fontSize: 12 * scale,
    fontWeight: '600' as const,
  },
  linkedFromBadge: {
    position: 'absolute' as const,
    top: -4 * scale,
    left: -4 * scale,
    borderRadius: 22 * scale,
    borderWidth: 4 * scale,
    borderColor: colors.background,
    backgroundColor: colors.background,
  },
  videoInfo: {
    width: '100%',
    paddingHorizontal: 16 * scale,
    marginBottom: 4 * scale,
  },
  videoTitle: {
    color: colors.text,
    fontSize: 14 * scale,
    fontWeight: '500' as const,
    lineHeight: 20 * scale,
  },
  videoDirector: {
    color: colors.textSecondary,
    fontSize: 14 * scale,
    marginTop: 4 * scale,
  },
  videoTime: {
    color: colors.textSecondary,
    fontSize: 14 * scale,
    marginTop: 4 * scale,
    fontWeight: '500' as const,
  },
  actionBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 12 * scale,
    paddingHorizontal: 16 * scale,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  inputField: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    paddingVertical: 2 * scale,
    marginTop: 2 * scale,
  }
});
