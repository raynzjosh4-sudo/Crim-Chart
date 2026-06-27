import { TagOverlay } from '@/channel/pages/tag/TagOverlay';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Eye, MessageCircle, Pause, Play, Tag } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoPost } from '../../video/models/VideoPost';
import { LikeButton } from '../../video/widgets/LikeButton';

interface ShortVideoPlayerCardProps {
  video: VideoPost;
  preloadStatus?: 'playing' | 'preloading' | 'idle';
  isShrunken?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onChart?: () => void;
  onAuthorPress?: () => void;
  onShrunkenTap?: () => void;
  hideBottomInput?: boolean;
  disableInteractions?: boolean;
}


const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const ShortVideoPlayerCardComponent = ({
  video,
  preloadStatus = 'idle',
  isShrunken = false,
  onLike,
  onComment,
  onShare,
  onChart,
  onAuthorPress,
  onShrunkenTap,
  hideBottomInput = false,
  disableInteractions = false,
}: ShortVideoPlayerCardProps) => {
  const [liked, setLiked] = useState<boolean>(video.isLiked);
  const [likesCount, setLikesCount] = useState<number>(video.likesCount);
  const [tagOverlayVisible, setTagOverlayVisible] = useState(false);
  const [showPlayPause, setShowPlayPause] = useState(false);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [progress, setProgress] = useState(0);
  const hidePlayPauseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isPlaying = preloadStatus === 'playing';

  const player = useVideoPlayer(preloadStatus === 'idle' ? null : video.videoUrl, p => {
    p.loop = true;
    if (isPlaying) p.play();
    else p.pause();
  });

  // Keep play state in sync with parent but allow user overrides
  useEffect(() => {
    // Reset user pause state when video comes into view
    if (isPlaying) {
      setIsPausedByUser(false);
    }

    try {
      if (isPlaying && !isPausedByUser) player.play();
      else player.pause();
    } catch (e) { }
  }, [isPlaying, isPausedByUser, player]);

  // Track video progress
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && !isPausedByUser) {
      interval = setInterval(() => {
        try {
          if (player && player.duration > 0) {
            setProgress((player.currentTime / player.duration) * 100);
          }
        } catch (e) {
          // player might be released if unmounted
        }
      }, 50);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isPausedByUser, player]);

  const togglePlayPause = () => {
    if (isShrunken) {
      onShrunkenTap?.();
      return;
    }

    const nextState = !isPausedByUser;
    setIsPausedByUser(nextState);
    try {
      if (nextState) player.pause();
      else player.play();
    } catch (e) { }

    setShowPlayPause(true);
    fadeAnim.setValue(1);

    if (hidePlayPauseTimeout.current) clearTimeout(hidePlayPauseTimeout.current);
    hidePlayPauseTimeout.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowPlayPause(false));
    }, 800);
  };

  const handleLike = useCallback(() => {
    setLiked(!liked);
    setLikesCount(likesCount + (liked ? -1 : 1));
    onLike?.();
  }, [liked, likesCount, onLike]);

  return (
    <Pressable style={[styles.container, isShrunken && styles.shrunken]} delayPressIn={150} onPress={togglePlayPause}>
      {player ? (
        <VideoView
          player={player}
          style={[
            StyleSheet.absoluteFillObject,
            !hideBottomInput && { bottom: 61 } // End exactly where the progress bar starts (58px bar + 3px progress bar)
          ]}
          contentFit="cover"
          nativeControls={false}
        />
      ) : null}

      <SafeAreaView style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Overlay gradient */}
        {!isShrunken && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']}
            style={styles.gradient}
            pointerEvents="none"
          />
        )}

        {!isShrunken && (
          <>
            {/* Bottom info */}
            <View style={[styles.bottomInfo, hideBottomInput ? { bottom: 90 } : { bottom: 70 }]} pointerEvents="box-none">

              {/* Author Row */}
              <View style={styles.authorRow}>
                <Image
                  source={{ uri: video.authorAvatarUrl || undefined }}
                  style={styles.avatar}
                />
                <Text style={styles.authorName}>{video.authorName}</Text>
                <TouchableOpacity style={styles.followButton}>
                  <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
              </View>

              {/* Caption */}
              <Text style={styles.caption} numberOfLines={2}>
                {video.caption || 'A stunning cinematic short video captured straight from your device.'}
              </Text>

              {/* Audio Info */}
              <View style={styles.audioRow}>
                <Text style={styles.audioText}>🎵  {video.authorName} • Original audio</Text>
              </View>
            </View>

            {/* Right-side action buttons */}
            <View
              style={[styles.actions, hideBottomInput ? { bottom: 90 } : { bottom: 70 }]}
              pointerEvents={disableInteractions ? 'none' : 'auto'}
            >
              <ActionBtn
                icon={<Image source={{ uri: video.authorAvatarUrl || undefined }} style={styles.actionsAvatar} />}
                onPress={() => { }} // Handle author press if needed
                noBackground
              />
              <View style={[styles.actionPill, { marginTop: -16 }]}>
                <LikeButton
                  initialLikes={video.likesCount}
                  isLiked={video.isLiked}
                />
              </View>
              <ActionBtn
                icon={<MessageCircle color="#FFF" size={30} />}
                count={video.commentsCount}
                onPress={onComment}
              />
              <ActionBtn
                icon={<Tag color="#FFF" size={30} />}
                count={video.tagsCount ?? 0}
                onPress={() => setTagOverlayVisible(true)}
              />
              <ActionBtn
                icon={<Eye color="#FFF" size={30} />}
                count={video.viewsCount ?? 0}
              />
            </View>

            {/* Sleek Progress Bar */}
            <View style={[styles.progressBarContainer, hideBottomInput ? { bottom: 75 } : { bottom: 58 }]} pointerEvents="none">
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>

            {/* Bottom Input Area */}
            {!hideBottomInput && (
              <View style={styles.inputContainerWrapper} pointerEvents={disableInteractions ? 'none' : 'auto'}>
                <TouchableOpacity style={styles.commentButton} onPress={onComment} activeOpacity={0.8}>
                  <Text style={styles.commentButtonText}>Add comment...</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Play/Pause icon */}
        {showPlayPause && (
          <Animated.View style={[styles.playPauseOverlay, { opacity: fadeAnim }]} pointerEvents="none">
            {isPausedByUser ? (
              <Pause size={42} color="#FFF" fill="#FFF" />
            ) : (
              <Play size={42} color="#FFF" fill="#FFF" />
            )}
          </Animated.View>
        )}
        <TagOverlay
          visible={tagOverlayVisible}
          onClose={() => setTagOverlayVisible(false)}
          postId={video.id ?? ''}
          sourceChannelId={video.channelId ?? ''}
          linkChain={[]}
        />
      </SafeAreaView>
    </Pressable>
  );
};

export const ShortVideoPlayerCard = React.memo(ShortVideoPlayerCardComponent);

interface ActionBtnProps {
  icon: React.ReactNode;
  count?: number;
  label?: string;
  onPress?: () => void;
  noBackground?: boolean;
}

const ActionBtn = ({ icon, count, label, onPress, noBackground }: ActionBtnProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[styles.actionBtn, !noBackground && styles.actionPill]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {icon}
        <Text style={styles.actionCount}>{label ?? (count != null ? count : '')}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_W,
    height: SCREEN_H,
    backgroundColor: '#000',
    position: 'relative',
  },
  shrunken: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 70, // Moved down to make room for input
    left: 12,
    right: 80,
    gap: 8,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: '#1A1A1A',
  },
  actionsAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFF',
    marginBottom: 8,
  },
  authorName: { color: '#FFF', fontWeight: 'bold', fontSize: 16, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
  followButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    marginLeft: 2,
  },
  followButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  caption: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 6,
  },
  audioRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  audioText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4
  },
  actions: {
    position: 'absolute',
    right: 8,
    bottom: 80,
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 4,
  },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionPill: {
    alignItems: 'center',
    minWidth: 50,
  },
  actionCount: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
    marginTop: 2,
  },
  inputContainerWrapper: {
    position: 'absolute',
    bottom: 0, // Sit at the absolute bottom
    left: 0,
    right: 0, // Span full width edge-to-edge
    backgroundColor: '#1C1C1E', // Solid dark theme background (blocks video)
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16, // Extra padding for the bottom
  },
  commentButton: {
    backgroundColor: 'rgba(255,255,255,0.08)', // Slight contrast against the solid bar
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  commentButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
  },
  playPauseOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
