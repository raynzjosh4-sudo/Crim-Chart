import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { Heart } from 'lucide-react-native';

interface LikeActionProps {
  initialLikesCount: number;
  initialIsLiked: boolean;
  onLikeTap?: () => void;
}

export const LikeAction: React.FC<LikeActionProps> = ({
  initialLikesCount,
  initialIsLiked,
  onLikeTap,
}) => {
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const scale = useSharedValue(1);

  // Sync state if props change asynchronously (e.g. from interaction store)
  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikesCount(initialLikesCount);
  }, [initialIsLiked, initialLikesCount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLikePress = () => {
    scale.value = withSequence(withSpring(1.2), withSpring(1));
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    if (onLikeTap) {
      onLikeTap();
    }
  };

  return (
    <TouchableOpacity activeOpacity={1} style={styles.actionButton} onPress={handleLikePress}>
      <Animated.View style={animatedStyle}>
        <Heart size={24} color={isLiked ? theme.colors.error : theme.colors.text} fill={isLiked ? theme.colors.error : 'transparent'} />
      </Animated.View>
      <Text style={styles.actionText}>{likesCount}</Text>
    </TouchableOpacity>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => ({
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
});
