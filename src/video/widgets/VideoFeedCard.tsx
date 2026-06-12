import CommentInputField from '@/commentingsheets/widgets/CommentInputField';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Bookmark, Heart, MessageCircle, Pause, Play, Tag } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { VideoPost } from '../models/VideoPost';
import { LikeButton } from './LikeButton';

interface VideoFeedCardProps {
  video: VideoPost;
  isPlaying: boolean;
  isShrunken?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onChart?: () => void;
  onAuthorPress?: () => void;
  onShrunkenTap?: () => void;
  hideBottomInput?: boolean;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const VideoFeedCard = ({
  video,
  isPlaying,
  isShrunken = false,
  onLike,
  onComment,
  onShare,
  onChart,
  onAuthorPress,
  onShrunkenTap,
  hideBottomInput = false,
}: VideoFeedCardProps) => {
  const [liked, setLiked] = useState<boolean>(video.isLiked);
  const [likesCount, setLikesCount] = useState<number>(video.likesCount);
  const [showPlayPause, setShowPlayPause] = useState(false);
  const [isPausedByUser, setIsPausedByUser] = useState(!isPlaying);
  const [progress, setProgress] = useState(0);
  const hidePlayPauseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const player = useVideoPlayer(video.videoUrl, p => {
    p.loop = true;
    if (isPlaying) p.play();
    else p.pause();
  });

  // Keep play state in sync with parent but allow user overrides
  useEffect(() => {
    if (isPlaying && !isPausedByUser) player.play();
    else player.pause();
  }, [isPlaying, isPausedByUser, player]);

  // Track video progress
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && !isPausedByUser) {
      interval = setInterval(() => {
        if (player && player.duration > 0) {
          setProgress((player.currentTime / player.duration) * 100);
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
    if (nextState) player.pause();
    else player.play();

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
    <Pressable style={[styles.container, isShrunken && styles.shrunken]} onPress={togglePlayPause}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Overlay gradient */}
      {!isShrunken && (
        <LinearGradient 
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient} 
        />
      )}

      {!isShrunken && (
        <>
          {/* Bottom info */}
          <View style={[styles.bottomInfo, hideBottomInput && { bottom: 20 }]}>
            <TouchableOpacity style={styles.authorRow} onPress={onAuthorPress}>
              <Text style={styles.authorName}>@{video.authorName}</Text>
            </TouchableOpacity>
            {video.caption ? (
              <Text style={styles.caption} numberOfLines={2}>{video.caption}</Text>
            ) : null}
          </View>

          {/* Right-side action buttons */}
          <View style={[styles.actions, hideBottomInput && { bottom: 20 }]}>
            <ActionBtn
              icon={<Image source={{ uri: video.authorAvatarUrl ?? '' }} style={styles.actionsAvatar} />}
              onPress={() => {}} // Handle author press if needed
            />
            <LikeButton 
              initialLikes={video.likesCount}
              isLiked={video.isLiked}
            />
            <ActionBtn
              icon={<MessageCircle color="#FFF" size={38} />}
              count={video.commentsCount}
              onPress={onComment}
            />
            <ActionBtn
              icon={<Tag color="#4A90E2" size={38} />}
              count={video.tagsCount ?? 0}
            />
            <ActionBtn
              icon={<Bookmark color="#FFF" size={38} />}
              count={58}
            />
          </View>

          {/* Bottom Input Area */}
          {!hideBottomInput && (
            <View style={styles.inputContainerWrapper}>
              <TouchableOpacity style={styles.commentButton} onPress={onComment} activeOpacity={0.8}>
                <Text style={styles.commentButtonText}>Add comment...</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Play/Pause icon */}
      {showPlayPause && (
        <Animated.View style={[styles.playPauseOverlay, { opacity: fadeAnim }]}>
          {isPausedByUser ? (
            <Pause size={42} color="#FFF" fill="#FFF" />
          ) : (
            <Play size={42} color="#FFF" fill="#FFF" />
          )}
        </Animated.View>
      )}
    </Pressable>
  );
};

interface ActionBtnProps {
  icon: React.ReactNode;
  count?: number;
  label?: string;
  onPress?: () => void;
}

const ActionBtn = ({ icon, count, label, onPress }: ActionBtnProps) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.75}>
    {icon}
    <Text style={styles.actionCount}>{label ?? (count != null ? count : '')}</Text>
  </TouchableOpacity>
);

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
    gap: 6,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFF',
    backgroundColor: '#1A1A1A',
  },
  actionsAvatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 2,
    borderColor: '#FFF',
    marginBottom: 8,
  },
  authorName: { color: '#FFF', fontWeight: 'bold', fontSize: 18, textShadowColor: '#000', textShadowRadius: 4 },
  channelName: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  caption: {
    color: '#FFF',
    fontSize: 13,
    lineHeight: 17,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
  actions: {
    position: 'absolute',
    right: 4,
    bottom: 70,
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 4,
  },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionCount: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
  inputContainerWrapper: {
    position: 'absolute',
    bottom: 24, // Enough padding for bottom tabs / safe area
    left: 12,
    right: 80,
    paddingHorizontal: 12,
  },
  commentButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  playPauseOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -35 }, { translateY: -35 }],
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
