import UserAvatar from '@/components/avatar/UserAvatar';
import { AnimatedPostButton } from '@/components/buttons/AnimatedPostButton';
import { VideoPlayerScreen } from '@/components/video/VideoPlayerScreen';
import { CommentAction } from '@/features/feed/components/CommentAction';
import { LikeAction } from '@/features/feed/components/LikeAction';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Check, Eye, MessageCircle, Play, Tag } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

/**
 * Inner component that owns useVideoPlayer.
 * By being a separate component, the hook only runs when this component
 * is actually rendered — so when disableVideoPlayer=true it is never mounted
 * and Android's audio session is never touched.
 */
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

export interface MovieListTileProps {
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
    isShort?: boolean;
  };
  onAddPress?: () => void;
  onTagPress?: () => void;
  onLikePress?: () => void;
  onVideoPress?: (params: any) => void;
  isAdded?: boolean;
  isLiked?: boolean;
  isCurrentlyPlaying?: boolean;
  disableVideoPlayer?: boolean;
}

export const MovieListTile = ({ video, onAddPress, onTagPress, onLikePress, onVideoPress, isAdded, isLiked, isCurrentlyPlaying, disableVideoPlayer }: MovieListTileProps) => {
  const router = useRouter();
  const [showPlayer, setShowPlayer] = useState(false);
  const isLocal = video.addedBy?.id === 'local_user';

  const [localTitle, setLocalTitle] = useState(video.title || '');
  const [localDirector, setLocalDirector] = useState(video.director || '');
  const [localDescription, setLocalDescription] = useState(video.description || 'A short cinematic video.');

  const videoToPlay = isLocal
    ? video.videoUrl
    : (video.videoUrl || 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

  return (
    <View style={styles.container}>
      {/* Facebook-style Post Header */}
      <View style={styles.postHeader}>
        {video.addedBy ? (
          <>
            <View style={styles.headerLeft}>
              <UserAvatar
                userId={video.addedBy.id}
                fallbackUrl={video.addedBy.avatarUrl}
                name={video.addedBy.name}
                size={36}
              />
              <View style={[styles.postHeaderText, { flex: 1 }]}>
                <Text style={styles.postHeaderName}>{video.addedBy?.name || 'Unknown User'}</Text>
                {isLocal ? (
                  <TextInput
                    style={[styles.postHeaderSub, styles.inputField]}
                    value={localDescription}
                    onChangeText={setLocalDescription}
                    placeholder="Add a description..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    multiline
                  />
                ) : (
                  <Text style={styles.postHeaderSub}>A short cinematic video.</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.followBtn, isLocal && { opacity: 0.5 }]}
              disabled={isLocal}
            >
              <Text style={styles.followBtnText}>Follow</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.headerLeft} />
        )}
      </View>

      {/* Cinematic Video Header */}
      <TouchableOpacity
        style={[
          styles.thumbnailContainer,
          { aspectRatio: video.isShort ? 3 / 4 : 16 / 9 }
        ]}
        activeOpacity={0.8}
        onPress={() => {
          if (onVideoPress) {
            onVideoPress({
              id: video.id,
              videoUrl: videoToPlay as string,
              title: isLocal ? localTitle : video.title,
              director: isLocal ? localDirector : (video.director || 'Unknown'),
              description: isLocal ? localDescription : (video.description || 'A short cinematic video.'),
              isLocal: isLocal,
              isShort: video.isShort
            });
          }
        }}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          {disableVideoPlayer ? (
            // Static image — no hooks, no audio session registration
            <Image
              source={{ uri: video.thumbnailUrl }}
              style={styles.videoThumbnail}
              contentFit="cover"
            />
          ) : (
            // TileVideoPlayer only mounts here, so useVideoPlayer is only
            // called for tiles that are actually in the live scrolling feed.
            <TileVideoPlayer
              videoUrl={videoToPlay as string}
              isPlaying={!!isCurrentlyPlaying}
              style={styles.videoThumbnail}
            />
          )}
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
        <View style={styles.playOverlay}>
          <Play size={24} color="#FFF" fill="#FFF" />
        </View>

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
        {isLocal ? (
          <TextInput
            style={[styles.videoTitle, styles.inputField, { marginBottom: 4 }]}
            value={localTitle}
            onChangeText={setLocalTitle}
            placeholder="Video Name"
            placeholderTextColor="rgba(255,255,255,0.4)"
          />
        ) : (
          <Text style={styles.videoTitle}>{video.title}</Text>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {isLocal ? (
            <TextInput
              style={[styles.videoDirector, styles.inputField, { flex: 1, marginRight: 8 }]}
              value={localDirector}
              onChangeText={setLocalDirector}
              placeholder="Director"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          ) : (
            <Text style={styles.videoDirector}>Directed by {video.director || 'Unknown'}</Text>
          )}
          <Text style={styles.videoTime}>{video.createdAt || 'Just now'}</Text>
        </View>
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
              label={(video.commentsCount || 0).toString()}
              size={20}
              direction="row"
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
          <TouchableOpacity
            style={[styles.tagButton, isAdded && styles.tagButtonAdded]}
            onPress={onTagPress}
          >
            {isAdded ? (
              <>
                <Check size={12} color="#000" style={{ marginRight: 6 }} />
                <Text style={[styles.tagButtonText, { color: '#000' }]}>Tagged</Text>
              </>
            ) : (
              <>
                <Tag size={12} color="#FFF" style={{ marginRight: 6 }} />
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
                await onAddPress();
              }
            }}
          />
        )}
      </View>

      <Modal visible={showPlayer} animationType="slide" onRequestClose={() => setShowPlayer(false)}>
        <VideoPlayerScreen
          url={video.videoUrl || video.thumbnailUrl || 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
          onClose={() => setShowPlayer(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: '#000',
  },
  thumbnailContainer: {
    width: '100%',
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
    flex: 1,
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
  followBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tagButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tagButtonAdded: {
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  tagButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
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
  videoTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
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
  inputField: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 2,
    marginTop: 2,
  }
});
