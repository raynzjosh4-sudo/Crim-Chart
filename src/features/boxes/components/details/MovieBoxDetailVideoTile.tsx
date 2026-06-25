import UserAvatar from '@/components/avatar/UserAvatar';
import { FollowUserButton } from '@/components/FollowUserButton';
import { BoxReactions } from '@/components/reactions/BoxReactions';
import { DownloadButton } from '@/components/buttons/DownloadButton';
import { useDelayedAutoPlay } from '@/features/auto_play/useDelayedAutoPlay';
import { useUserProfile } from '@/features/auth/application/useUserProfile';
import { InteractionType } from '@/features/boxes/application/useBoxInteractionTracker';
import { CommentAction } from '@/features/feed/components/CommentAction';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Download, Eye, MessageCircle, Play } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface CommentPreview {
  id: string;
  user: { id: string; name: string; avatarUrl: string; };
  text: string;
}

export interface AddedBy {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface MovieBoxDetailVideoTileProps {
  video: {
    id: string;
    title: string;
    director: string;
    thumbnailUrl: string;
    videoUrl?: string;
    duration: string;
    likes: number;
    dislikes: number;
    viewsCount?: number;
    commentsCount?: number;
    addedBy?: AddedBy;
    linkedFrom?: {
      id: string;
      avatarUrl: string;
      name: string;
    };
    postId?: string;
    boxId?: string;
    isShort?: boolean;
    recentComments?: CommentPreview[];
  };
  isPlaying?: boolean;
  onVideoPress?: () => void;
  onCommentPress?: (postId: string) => void;
  currentUserId?: string;
  onInteraction?: (boxId: string, userId: string, type: InteractionType) => void;
}

const TileVideoPlayer = ({ videoUrl, isPlaying, style }: { videoUrl: string; isPlaying: boolean; style: any }) => {
  const player = useVideoPlayer(isPlaying ? videoUrl : null, p => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (!player) return;
    if (isPlaying) player.play();
    else player.pause();
  }, [isPlaying, player]);

  return (
    <VideoView
      player={player!}
      style={style}
      contentFit="cover"
      allowsFullscreen={false}
      allowsPictureInPicture={false}
      nativeControls={false}
    />
  );
};

export const MovieBoxDetailVideoTile = ({ video, isPlaying, onVideoPress, onCommentPress, currentUserId, onInteraction }: MovieBoxDetailVideoTileProps) => {
  const router = useRouter();
  const { shouldPlay } = useDelayedAutoPlay(!!isPlaying, 5000);
  const profile = useUserProfile(video.addedBy?.id);
  const crownTitle = profile?.crownTitle || 'Added a video';

  return (
    <View style={styles.container}>
      {/* Facebook-style Post Header */}
      <View style={styles.postHeader}>
        {video.addedBy ? (
          <View style={styles.headerLeft}>
            <UserAvatar
              userId={video.addedBy.id}
              fallbackUrl={video.addedBy.avatarUrl}
              name={video.addedBy.name}
              size={44}
            />
            <View style={styles.postHeaderText}>
              <Text style={styles.postHeaderName}>{video.addedBy.name}</Text>
              <Text style={styles.postHeaderSub}>{crownTitle}</Text>
            </View>
            <FollowUserButton targetUserId={video.addedBy.id} size="small" style={{ flex: 0, marginLeft: 12 }} />
          </View>
        ) : (
          <View style={styles.headerLeft} />
        )}

        <DownloadButton 
          onPress={() => {}}
          style={styles.downloadBtn}
          color="rgba(255,255,255,0.8)"
          size={20}
        />
      </View>

      {/* Cinematic Video Header */}
      <TouchableOpacity
        style={[styles.thumbnailContainer, video.isShort && { aspectRatio: 4 / 5, borderRadius: 0 }]}
        onPress={onVideoPress}
        activeOpacity={0.8}
      >
        {shouldPlay && video.videoUrl ? (
          <TileVideoPlayer videoUrl={video.videoUrl} isPlaying={shouldPlay} style={styles.videoThumbnail} />
        ) : (
          <Image source={video.thumbnailUrl ? { uri: video.thumbnailUrl } : undefined} style={styles.videoThumbnail} contentFit="cover" />
        )}

        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>

        {!shouldPlay && (
          <View style={styles.playOverlay}>
            <Play size={24} color="#FFF" fill="#FFF" />
          </View>
        )}

        {/* Avatar of the original user if the track was linked from somewhere */}
        {video.linkedFrom && (
          <View style={styles.linkedFromBadge}>
            <UserAvatar
              userId={video.linkedFrom.id}
              fallbackUrl={video.linkedFrom.avatarUrl}
              name={video.linkedFrom.name}
              size={36}
            />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{video.title}</Text>
      </View>

      {/* Inline Comments Preview (Before Action Bar) */}
      {video.recentComments && video.recentComments.length > 0 && (
        <View style={styles.commentsContainer}>
          {video.recentComments.slice(0, 2).map(comment => (
            <View key={comment.id} style={styles.commentRow}>
              <UserAvatar
                userId={comment.user.id}
                fallbackUrl={comment.user.avatarUrl}
                name={comment.user.name}
                size={20}
              />
              <Text style={styles.commentText} numberOfLines={2}>
                <Text style={styles.commentUser}>{comment.user.name} </Text>
                {comment.text}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Facebook-style Action Bar */}
      <View style={styles.actionBar}>
        <BoxReactions
          boxItemId={video.id}
          postId={video.postId}
          boxId={video.boxId}
          initialLikes={video.likes}
          initialDislikes={video.dislikes}
          currentUserId={currentUserId}
          onInteraction={onInteraction}
        />

        <View style={styles.actionBtn}>
          <CommentAction
            icon={MessageCircle}
            label={video.commentsCount ? `${video.commentsCount}` : '0'}
            size={24}
            direction="row"
            onPress={() => video.postId && onCommentPress?.(video.postId)}
          />
        </View>

        <View style={[styles.actionBtn, { marginLeft: 'auto', marginRight: 0 }]}>
          <Eye size={24} color="#FFF" />
          <Text style={styles.actionText}>{video.viewsCount ? `${video.viewsCount}` : '0'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  playOverlay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    transform: [{ scale: 1.1 }],
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postHeaderText: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  postHeaderName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  postHeaderSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  followBtn: {
    marginLeft: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },

  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkedFromBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#000',
  },
  videoInfo: {
    width: '100%',
    paddingHorizontal: 16,
  },
  videoTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  videoDirector: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  commentsContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  commentUser: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  commentText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    marginLeft: 8,
  }
});
