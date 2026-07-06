import { useStyles } from "@/core/hooks/useStyles";
import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, Easing } from 'react-native-reanimated';
import { useCurrentTheme } from '@/core/store/useThemeStore';
export interface AnimatedPostButtonProps {
  onPress: () => Promise<void> | void;
  title?: string;
  style?: ViewStyle | any;
  textStyle?: TextStyle | any;
}
export const AnimatedPostButton: React.FC<AnimatedPostButtonProps> = ({
  onPress,
  title = "Post",
  style,
  textStyle
}) => {
  const styles = useStyles(colors => ({
    postingContainer: {
      opacity: 0.8
    },
    button: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
    text: {
      color: colors.background,
      fontWeight: 'bold',
      fontSize: 12
    }
  }));
  const [isPosting, setIsPosting] = useState(false);
  const scale = useSharedValue(1);
  const theme = useCurrentTheme();
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        scale: scale.value
      }]
    };
  });
  const handlePress = async () => {
    if (isPosting) return;

    // Press animation
    scale.value = withTiming(0.95, {
      duration: 100,
      easing: Easing.inOut(Easing.ease)
    }, () => {
      scale.value = withTiming(1, {
        duration: 100
      });
    });
    setIsPosting(true);
    try {
      await onPress();
    } finally {
      // Small delay so the user sees the completion before it vanishes
      setTimeout(() => setIsPosting(false), 300);
    }
  };
  return <Animated.View style={[animatedStyle, style, isPosting && styles.postingContainer]}>
      <TouchableOpacity style={styles.button} onPress={handlePress} disabled={isPosting} activeOpacity={0.8}>
        {isPosting ? <ActivityIndicator size="small" color={textStyle?.color || theme.colors.background} /> : <Text style={[styles.text, {
        color: theme.colors.background
      }, textStyle]}>{title}</Text>}
      </TouchableOpacity>
    </Animated.View>;
};