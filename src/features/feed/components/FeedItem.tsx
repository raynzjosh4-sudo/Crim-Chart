import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Pressable } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MessageCircle, Tag, Bookmark, Play, Pause } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { MemberImage } from '@/features/profile/components/MemberImage';
import { colors } from '@/core/theme/colors';
import { LikeAction } from './LikeAction';
import { CommentAction } from './CommentAction';
import { CommentInputField } from './CommentInputField';

const { width, height } = Dimensions.get('window');

interface FeedItemProps {
  id: string;
  videoUrl: string;
  authorName: string;
  authorAvatarUrl?: string;
  description: string;
  likesCount: number;
  commentsCount: number;
  tagsCount: number;
  isActive: boolean;
}

export const FeedItem: React.FC<FeedItemProps> = ({
  id,
  videoUrl,
  authorName,
  authorAvatarUrl,
  description,
  likesCount,
  commentsCount,
  tagsCount,
  isActive,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const iconTimer = useRef<NodeJS.Timeout | null>(null);

  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
    player.muted = false;
    if (isActive) {
      player.play();
    }
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  const handleTap = () => {
    if (isPaused) {
      player.play();
      setIsPaused(false);
    } else {
      player.pause();
      setIsPaused(true);
    }
    
    setShowIcon(true);
    if (iconTimer.current) clearTimeout(iconTimer.current);
    iconTimer.current = setTimeout(() => setShowIcon(false), 800);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.videoContainer} onPress={handleTap}>
        <VideoView 
          style={StyleSheet.absoluteFill} 
          player={player} 
          contentFit="cover"
          nativeControls={false}
        />
        
        {/* Play/Pause Icon Overlay */}
        {showIcon && (
          <Animated.View 
            entering={FadeIn.duration(200)} 
            exiting={FadeOut.duration(200)}
            style={styles.iconOverlay}
          >
            <View style={styles.iconCircle}>
              {isPaused ? (
                <Pause size={34} color="#FFF" fill="#FFF" />
              ) : (
                <Play size={34} color="#FFF" fill="#FFF" />
              )}
            </View>
          </Animated.View>
        )}

        {/* Right Action Column */}
        <View style={styles.rightColumn}>
          <MemberImage 
            imageUrl={authorAvatarUrl} 
            size={55} 
          />
          <View style={styles.actionSpacer} />
          <LikeAction initialLikes={likesCount} initialIsLiked={false} />
          <View style={styles.actionSpacer} />
          <CommentAction icon={MessageCircle} label={commentsCount.toString()} />
          <View style={styles.actionSpacer} />
          <CommentAction icon={Tag} label={tagsCount.toString()} color={colors.primary} />
          <View style={styles.actionSpacer} />
          <CommentAction icon={Bookmark} label="58" />
        </View>

        {/* Bottom Info Overlay */}
        <View style={styles.bottomInfo}>
          <View style={styles.authorRow}>
            <MemberImage imageUrl={authorAvatarUrl} size={28} />
            <Text style={styles.authorName}>{authorName}</Text>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        </View>
      </Pressable>

      {/* Bottom Seeker & Comment Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.seekerBackground}>
          <View style={[styles.seekerProgress, { width: '40%' }]} />
        </View>
        <CommentInputField onSend={() => {}} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: height - 80, // Approximate tab bar height
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
  },
  iconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightColumn: {
    position: 'absolute',
    right: 8,
    bottom: 120,
    alignItems: 'center',
  },
  actionSpacer: {
    height: 16,
  },
  bottomInfo: {
    position: 'absolute',
    left: 12,
    bottom: 110,
    right: 80,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  authorName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.54)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.54)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  seekerBackground: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  seekerProgress: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});
