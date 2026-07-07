import React, { useState, useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, StyleProp } from 'react-native';
import { Eye, Heart, MessageCircle, Tag } from 'lucide-react-native';

export interface PostFooterProps {
  isLocal?: boolean;
  
  // Interaction props
  isLiked?: boolean;
  likesCount?: number | string;
  commentsCount?: number | string;
  viewsCount?: number | string;
  tagsCount?: number | string;
  isTagged?: boolean;

  // Icon configuration
  iconSize?: number;

  // Handlers
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onViewPress?: () => void;
  onTagPress?: () => void;

  // Render props for overriding the buttons inside the left group
  leftContent?: React.ReactNode;

  // Render props for the right side (Downloads, tag, etc)
  rightContent?: React.ReactNode;

  // Style props
  style?: StyleProp<ViewStyle>;
}

export const PostFooter: React.FC<PostFooterProps> = ({
  likesCount = 0,
  isLiked = false,
  onLikePress,
  commentsCount = 0,
  onCommentPress,
  viewsCount = 0,
  tagsCount = 0,
  isTagged = false,
  onTagPress,
  onViewPress,
  leftContent,
  iconSize = 24,
  rightContent,
  style,
  isLocal = false
}) => {
  console.log(`[PostFooter Debug Render] likesCount=${likesCount}, isLiked=${isLiked}`);
  
  const [localIsLiked, setLocalIsLiked] = useState<boolean>(isLiked || false);
  const [localLikesCount, setLocalLikesCount] = useState<number>(Number(likesCount) || 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    console.log(`[PostFooter Debug Effect] Syncing props -> isLiked: ${isLiked}, likesCount: ${likesCount}`);
    setLocalIsLiked(isLiked || false);
    setLocalLikesCount(Number(likesCount) || 0);
  }, [isLiked, likesCount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLikePress = () => {
    if (isLocal) return;
    const newIsLiked = !localIsLiked;
    const newCount = localIsLiked ? localLikesCount - 1 : localLikesCount + 1;
    console.log('[PostFooter Debug] Like button pressed. Current localIsLiked:', localIsLiked, 'New state:', newIsLiked);
    scale.value = withSequence(withSpring(1.2), withSpring(1));
    setLocalIsLiked(newIsLiked);
    setLocalLikesCount(newCount);
    if (onLikePress) {
      console.log('[PostFooter Debug] Invoking onLikePress prop handler');
      onLikePress();
    }
  };

  return (
    <View style={[styles.actionBar, style]}>
      <View style={styles.leftGroup}>
        {leftContent ? (
          leftContent
        ) : (
          <>
            <TouchableOpacity 
              activeOpacity={1}
              style={[styles.actionBtn, isLocal && { opacity: 0.3 }]}
              disabled={isLocal}
              onPress={handleLikePress}
            >
              <Animated.View style={animatedStyle}>
                <Heart size={iconSize} color={localIsLiked ? "#E21" : "#FFF"} fill={localIsLiked ? "#E21" : "transparent"} />
              </Animated.View>
              <Text style={styles.actionText}>{localLikesCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={1}
              style={[styles.actionBtn, isLocal && { opacity: 0.3 }]}
              disabled={isLocal}
              onPress={onCommentPress}
            >
              <MessageCircle size={iconSize} color="#FFF" />
              <Text style={styles.actionText}>{commentsCount}</Text>
            </TouchableOpacity>

            {(viewsCount !== undefined || onViewPress) && (
              <TouchableOpacity 
                activeOpacity={1}
                style={[styles.actionBtn, isLocal && { opacity: 0.3 }]}
                disabled={isLocal}
                onPress={onViewPress}
              >
                <Eye size={iconSize} color="#FFF" />
                <Text style={styles.actionText}>{viewsCount ?? 0}</Text>
              </TouchableOpacity>
            )}

            {(tagsCount !== undefined || onTagPress) && (
              <TouchableOpacity 
                activeOpacity={1}
                style={[styles.actionBtn, isLocal && { opacity: 0.3 }]}
                disabled={isLocal}
                onPress={onTagPress}
              >
                <Tag size={iconSize} color={isTagged ? "#E21" : "#FFF"} />
                <Text style={[styles.actionText, isTagged && { color: "#E21" }]}>{tagsCount ?? 0}</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {rightContent && (
        <View style={styles.rightGroup}>
          {rightContent}
        </View>
      )}
    </View>
  );
};

export const PostFooterStyles = StyleSheet.create({
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  }
});

const styles = StyleSheet.create({
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allow left side to take up space
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: PostFooterStyles.actionBtn,
  actionText: PostFooterStyles.actionText,
});
