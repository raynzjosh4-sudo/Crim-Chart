import { useStyles } from "@/core/hooks/useStyles";
import { useCurrentTheme } from "@/core/store/useThemeStore";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring, withSequence, useSharedValue } from 'react-native-reanimated';
interface LikeActionProps {
  initialLikes: number;
  initialIsLiked: boolean;
  onPress?: (isLiked: boolean) => void;
  size?: number;
  direction?: 'row' | 'column';
  icon?: any;
  activeColor?: string;
  inactiveColor?: string;
  fillActive?: boolean;
}
export const LikeAction: React.FC<LikeActionProps> = ({
  initialLikes,
  initialIsLiked,
  onPress,
  size = 38,
  direction = 'column',
  icon: Icon = Heart,
  activeColor = '#FF4B4B',
  inactiveColor,
  fillActive = true
}) => {
  const theme = useCurrentTheme();
  const effectiveInactiveColor = inactiveColor || theme.colors.text;

  const styles = useStyles(colors => ({
    container: {
      alignItems: 'center',
      gap: 4
    },
    count: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      textShadowColor: 'rgba(0, 0, 0, 0.54)',
      textShadowOffset: {
        width: 0,
        height: 1
      },
      textShadowRadius: 4
    },
    countRow: {
      marginLeft: 6,
      textShadowColor: 'transparent'
    }
  }));
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likes, setLikes] = useState(initialLikes);
  const scale = useSharedValue(1);
  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);
  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{
      scale: scale.value
    }]
  }));
  const handlePress = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikes(likes + (newLiked ? 1 : -1));
    scale.value = withSequence(withSpring(1.4), withSpring(1));
    if (onPress) onPress(newLiked);
  };
  return <TouchableOpacity style={[styles.container, {
    flexDirection: direction
  }]} onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={animatedStyle}>
        <Icon size={size} color={isLiked ? activeColor : effectiveInactiveColor} fill={isLiked && fillActive ? activeColor : 'transparent'} />
      </Animated.View>
      <Text style={[styles.count, direction === 'row' && styles.countRow]}>{likes}</Text>
    </TouchableOpacity>;
};