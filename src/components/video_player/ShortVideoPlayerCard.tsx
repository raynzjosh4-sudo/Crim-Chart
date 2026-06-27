import { LikeButtonWrapper } from '@/components/wrappers/LikeButtonWrapper';
import { useAppRouter } from '@/core/hooks/useAppRouter';
import { TagOverlay } from '@/channel/pages/tag/TagOverlay';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Eye, MessageCircle, Pause, Play, Tag } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoPost } from '../../video/models/VideoPost';
import { LikeButton } from '../../video/widgets/LikeButton';
import { VideoScrubber } from './VideoScrubber';

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
  const router = useAppRouter();
  
  // Seed the global store on mount with this video's initial data
  useEffect(() => {
    useInteractionStore.getState().seedPost(
      video.postId,
      video.likesCount,
      video.viewsCount || 0,
      video.isLiked,
      0, // initial downloads count
      undefined, // boxId
      video.commentsCount || 0
    );
  }, [video.postId, video.likesCount, video.viewsCount, video.isLiked, video.commentsCount]);

  // Read from the global store (fallback to props if not seeded yet)
  const globalLiked = useInteractionStore(s => s.likes[video.postId]);
  const globalLikesCount = useInteractionStore(s => s.likesCount[video.postId]);
  const globalCommentsCount = useInteractionStore(s => s.postCommentsCount[video.postId]);
  const globalViewsCount = useInteractionStore(s => s.viewsCount[video.postId]);
  
  const liked = globalLiked !== undefined ? globalLiked : video.isLiked;
  const likesCount = globalLikesCount !== undefined ? globalLikesCount : video.likesCount;
  const commentsCount = globalCommentsCount !== undefined ? globalCommentsCount : (video.commentsCount ?? 0);
  const viewsCount = globalViewsCount !== undefined ? globalViewsCount : (video.viewsCount ?? 0);

  const [tagOverlayVisible, setTagOverlayVisible] = useState(false);
  const [showPlayPause, setShowPlayPause] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const hidePlayPauseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(video.videoUrl);
  const isPausedByUserRef = useRef(isPausedByUser);

  useEffect(() => {
    isPausedByUserRef.current = isPausedByUser;
  }, [isPausedByUser]);

  const isPlaying = (preloadStatus === 'playing') && !isPausedByUser && !isScrubbing;

  // Initialize player only if it's not idle to save memory
  const player = useVideoPlayer(preloadStatus === 'idle' ? null : currentVideoUrl, p => {
    p.loop = true;
    p.timeUpdateEventInterval = 0.25; // Trigger timeUpdate 4 times a second
  });

  // Fallback from HLS to MP4 if HLS is still processing (returns 404)
  useEffect(() => {
    if (!player) return;
    const subscription = player.addListener('statusChange', (event: any) => {
      if (event.status === 'error' && currentVideoUrl === video.videoUrl) {
        if (video.videoUrls && video.videoUrls.length > 1) {
          console.log('[ShortVideoPlayer] HLS not ready, falling back to raw MP4:', video.videoUrls[1]);
          setCurrentVideoUrl(video.videoUrls[1]);
        }
      }
    });
    return () => {
      subscription.remove();
    };
  }, [player, currentVideoUrl, video.videoUrl, video.videoUrls]);

  // Keep currentVideoUrl in sync if video prop changes (FlatList recycling)
  useEffect(() => {
    setCurrentVideoUrl(video.videoUrl);
    setIsPausedByUser(false);
  }, [video.videoUrl]);

  // Keep track of whether we've counted a view for this session
  const hasViewedRef = useRef(false);

  // Handle external play/pause state from FlatList
  useEffect(() => {
    if (!player) return;
    try {
      if (isPlaying) {
        player.play();
        
        // Track the view if we haven't already
        if (!hasViewedRef.current && video.postId) {
          hasViewedRef.current = true;
          // Increment the view in the interaction store
          useInteractionStore.getState().incrementView(video.postId, undefined, video.sourceType);
        }
      } else {
        player.pause();
      }
    } catch (e) { }
  }, [isPlaying, player, video.postId, video.sourceType]);

  // Efficient Progress Tracking (Runs natively, less React thread blocking)
  useEffect(() => {
    if (!player) return;
    const subscription = player.addListener('timeUpdate', (event: any) => {
      try {
        if (player.duration > 0) {
          const current = event.currentTime ?? player.currentTime;
          setProgress((current / player.duration) * 100);
        }
      } catch (e) { }
    });
    return () => {
      subscription.remove();
    };
  }, [player, isScrubbing]);

  const handleVideoPress = () => {
    if (disableInteractions || isShrunken) {
      if (onShrunkenTap) onShrunkenTap();
      return;
    }

    if (isScrubbing) return; // Don't trigger play/pause while scrubbing

    if (!player) return;

    if (player.playing) {
      isPausedByUserRef.current = true;
      setIsPausedByUser(true);
      player.pause();
      setShowPlayPause(true);
    } else {
      isPausedByUserRef.current = false;
      setIsPausedByUser(false);
      player.play();
      setShowPlayPause(true);
    }

    if (hidePlayPauseTimeout.current) {
      clearTimeout(hidePlayPauseTimeout.current);
    }
    
    fadeAnim.setValue(1);
    hidePlayPauseTimeout.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowPlayPause(false));
    }, 1500);
  };

  const toggleLike = useInteractionStore(s => s.toggleLike);

  const handleLike = useCallback((e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    // The store toggleLike will instantly update globalLiked and globalLikesCount, 
    // which triggers a re-render.
    toggleLike(video.postId, undefined, video.sourceType);
    
    onLike?.();
  }, [onLike, video.postId, video.sourceType, toggleLike]);

  const handleAuthorPress = useCallback(() => {
    if (video.sourceType === 'channel_post' && video.channelId) {
      router.push(`/channel/${video.channelId}`);
    } else if (video.authorId) {
      router.push(`/profile/${video.authorId}`);
    }
  }, [video, router]);

  return (
    <View style={[styles.container, isShrunken && styles.shrunken]}>
      <Pressable style={StyleSheet.absoluteFillObject} delayPressIn={150} onPress={handleVideoPress}>
        {/* Blurred background layer for filler */}
        {video.thumbnailUrl ? (
          <ExpoImage
            source={{ uri: video.thumbnailUrl }}
            style={[StyleSheet.absoluteFillObject, { opacity: 0.8 }]}
            contentFit="cover"
            blurRadius={25}
          />
        ) : null}

        {player ? (
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {Platform.OS === 'web' && (
              <View dangerouslySetInnerHTML={{
                __html: `<style>
                video { 
                  object-fit: contain !important; 
                  width: 100% !important; 
                  height: 100% !important; 
                }
              </style>` }} />
            )}
            <VideoView
              player={player}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
              nativeControls={false}
            />
          </View>
        ) : null}
      </Pressable>

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
            <View style={[styles.bottomInfo, hideBottomInput ? { bottom: 12 } : { bottom: 70 }]} pointerEvents="box-none">

              {/* Author Row */}
              <TouchableOpacity style={styles.authorRow} onPress={handleAuthorPress} activeOpacity={0.8}>
                <Image
                  source={{ uri: video.authorAvatarUrl || undefined }}
                  style={styles.avatar}
                />
                <Text style={styles.authorName}>{video.authorName}</Text>
                <TouchableOpacity style={styles.followButton}>
                  <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
              </TouchableOpacity>

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
              style={[styles.actions, hideBottomInput ? { bottom: 12 } : { bottom: 70 }]}
              pointerEvents={disableInteractions ? 'none' : 'auto'}
            >
              <ActionBtn
                icon={<Image source={{ uri: video.authorAvatarUrl || undefined }} style={styles.actionsAvatar} />}
                onPress={handleAuthorPress} // Handle author press if needed
                noBackground
              />
              <View style={[styles.actionPill, { marginTop: -16 }]}>
                <LikeButtonWrapper
                  postId={video.postId}
                  sourceTable={video.sourceType}
                  initialLikesCount={video.likesCount}
                  initialIsLiked={video.isLiked}
                  onLike={onLike}
                />
              </View>
              <ActionBtn
                icon={<MessageCircle color="#FFF" size={30} />}
                count={commentsCount}
                onPress={onComment}
              />
              <ActionBtn
                icon={<Tag color="#FFF" size={30} />}
                count={video.tagsCount ?? 0}
                onPress={() => setTagOverlayVisible(true)}
              />
              <ActionBtn
                icon={<Eye color="#FFF" size={30} />}
                count={viewsCount}
              />
            </View>

            {/* Sleek Progress Bar */}
            <VideoScrubber
              player={player}
              hideBottomInput={hideBottomInput}
              preloadStatus={preloadStatus}
              isPausedByUserRef={isPausedByUserRef}
              onScrubbingChange={setIsScrubbing}
            />

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
    </View>
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
    flex: 1,
    height: '100%', // Use 100% to fit exactly within the parent container
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
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
function setProgress(arg0: number) {
  throw new Error('Function not implemented.');
}

