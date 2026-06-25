import { UserAvatarImage } from '@/channel/pages/widgets2/memberimage/UserAvatarImage';
import { AnimatedPostButton } from '@/components/buttons/AnimatedPostButton';
import { CommentSheet } from '@/components/comments/CommentSheet';
import { FollowUserButton } from '@/components/FollowUserButton';
import { PostHeader } from '@/components/PostHeader/PostHeader';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { formatTimeAgo } from '@/components/formatTimeAgo';
import { VideoPlayerScreen } from '@/components/video/VideoPlayerScreen';
import { useCurrentUserProfile, useUserProfile } from '@/features/auth/application/useUserProfile';
import { CommentAction } from '@/features/feed/components/CommentAction';
import { LikeAction } from '@/features/feed/components/LikeAction';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Check, Eye, MessageCircle, Play, Tag, Volume2, VolumeX, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions, Platform } from 'react-native';
import { ShortVideoPlayerCard } from '../ShortVideoPlayerCard';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

const TileVideoPlayer = ({ videoUrl, isPlaying, isMuted, style, contentFit = "cover", isDesktop = false }: { videoUrl: string; isPlaying: boolean; isMuted: boolean; style: any; contentFit?: "cover" | "contain" | "fill"; isDesktop?: boolean }) => {
  const player = useVideoPlayer(isPlaying ? videoUrl : null, p => {
    p.loop = true;
    p.muted = isMuted;
  });

  useEffect(() => {
    if (!player) return;
    if (isPlaying) player.play();
    else player.pause();
  }, [isPlaying, player]);

  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [isMuted, player]);

  return (
    <VideoView
      player={player!}
      style={style}
      contentFit={contentFit}
      allowsFullscreen={isDesktop}
      allowsPictureInPicture={isDesktop}
      nativeControls={isDesktop}
    />
  );
};

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
    createdAt?: string;
    videoUrl?: string;
    sourceTable?: string;
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
  isCurrentlyPlaying?: boolean;
  disableVideoPlayer?: boolean;
}

export const ShortVideoPlayer = ({ video, onAddPress, onTagPress, onLikePress, onVideoPress, isAdded, isLiked, isCurrentlyPlaying, disableVideoPlayer }: ShortVideoPlayerProps) => {
  const router = useRouter();
  const [showPlayer, setShowPlayer] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isCommentSheetVisible, setIsCommentSheetVisible] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(Number(video.commentsCount) || 0);
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  useEffect(() => {
    setLocalCommentsCount(Number(video.commentsCount) || 0);
  }, [video.commentsCount]);

  const isLocal = video.addedBy?.id === 'local_user';

  const otherProfile = useUserProfile(isLocal ? undefined : video.addedBy?.id);
  const currentUserProfile = useCurrentUserProfile();
  const profile = isLocal ? currentUserProfile : otherProfile;

  const realName = isLocal ? (profile?.displayName || 'You') : (profile?.displayName || video.addedBy?.name || 'Unknown User');

  const [localTitle, setLocalTitle] = useState(video.title || '');

  const videoToPlay = video.videoUrl || '';

  return (
    <View style={styles.container}>
      {/* Facebook-style Post Header */}
      {video.addedBy ? (
        <PostHeader
          author={
            new CrimChartUserModel({
              id: video.addedBy.id,
              displayName: realName,
              profileImageUrl: profile?.profileImageUrl || video.addedBy.avatarUrl,
              isActive: profile?.isActive,
              hasStatus: profile?.hasStatus,
              statusCount: profile?.statusCount,
            })
          }
          isPersonalPost={video.sourceTable === 'posts' || isLocal}
          onAvatarTap={() => {
            if (!isLocal && video.addedBy?.id) {
              router.push(`/profile/${video.addedBy.id}`);
            }
          }}
        />
      ) : (
        <View style={styles.postHeader} />
      )}

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
        <View
          style={[
            styles.thumbnailContainer,
            {
              height: 600,
              backgroundColor: theme.colors.background,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.colors.surfaceVariant,
            }
          ]}
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
              {!disableVideoPlayer && isCurrentlyPlaying && (
                <TileVideoPlayer
                  videoUrl={videoToPlay as string}
                  isPlaying={true}
                  isMuted={isMuted}
                  style={styles.videoThumbnail as any}
                  contentFit="contain"
                  isDesktop={isDesktop}
                />
              )}
            </View>
          </View>
          {video.linkedFrom && (
            <View style={styles.linkedFromBadge}>
              <UserAvatarImage
                imageUrl={video.linkedFrom.avatarUrl}
                name={video.linkedFrom.name}
                size={44}
              />
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.thumbnailContainer,
            { aspectRatio: 9 / 16 }
          ]}
          activeOpacity={0.8}
          onPress={() => {
            if (onVideoPress) {
              onVideoPress({
                id: video.id,
                videoUrl: videoToPlay as string,
                title: isLocal ? localTitle : video.title,
                description: isLocal ? (profile?.crownTitle || '') : (video.description || 'A short cinematic video.'),
                isLocal: isLocal,
                isShort: true
              });
            } else if (videoToPlay) {
              setShowPlayer(true);
            }
          }}
        >
          <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
            <View style={{ width: '100%', height: '100%' }}>
              <Image
                source={video.thumbnailUrl ? { uri: video.thumbnailUrl } : undefined}
                style={styles.videoThumbnail as any}
                contentFit="cover"
              />
              {!disableVideoPlayer && isCurrentlyPlaying && (
                <TileVideoPlayer
                  videoUrl={videoToPlay as string}
                  isPlaying={true}
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
              <UserAvatarImage
                imageUrl={video.linkedFrom.avatarUrl}
                name={video.linkedFrom.name}
                size={44}
              />
            </View>
          )}
        </TouchableOpacity>
      )}


      <View style={{ paddingHorizontal: 16, alignItems: 'flex-end', marginBottom: 8 }}>
        <Text style={styles.videoTime}>{formatTimeAgo(video.createdAt)}</Text>
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <View style={[{ flexDirection: 'row', alignItems: 'center' }, isLocal && { opacity: 0.5 }]} pointerEvents={isLocal ? "none" : "auto"}>
          <View style={styles.actionBtn}>
            <LikeAction
              initialLikes={video.likes > 0 ? video.likes : 0}
              initialIsLiked={isLiked || false}
              onPress={isLocal ? undefined : onLikePress}
              size={20}
              direction="row"
            />
          </View>

          <View style={styles.actionBtn}>
            <CommentAction
              icon={MessageCircle}
              label={localCommentsCount.toString()}
              size={20}
              direction="row"
              onPress={isLocal ? undefined : () => setIsCommentSheetVisible(true)}
            />
          </View>

          <View style={[styles.actionBtn, { marginRight: 0 }]}>
            <CommentAction
              icon={Eye}
              label={(video.viewsCount || 0).toString()}
              size={20}
              direction="row"
            />
          </View>
        </View>

        {!isLocal ? (
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
        )}
      </View>

      <Modal visible={showPlayer} animationType="slide" onRequestClose={() => setShowPlayer(false)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <ShortVideoPlayerCard
            video={{
              id: video.id,
              videoUrl: (videoToPlay as string) || '',
              caption: isLocal ? localTitle : video.title,
              authorName: realName,
              authorAvatarUrl: profile?.profileImageUrl || video.addedBy?.avatarUrl || '',
              likesCount: video.likes || 0,
              isLiked: isLiked || false,
              commentsCount: localCommentsCount,
              viewsCount: video.viewsCount || 0,
              tagsCount: 0,
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
  actionBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginRight: 24 * scale,
  },
  actionText: {
    color: colors.text,
    fontSize: 14 * scale,
    fontWeight: '700' as const,
    marginLeft: 8 * scale,
  },
  inputField: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    paddingVertical: 2 * scale,
    marginTop: 2 * scale,
  }
});
