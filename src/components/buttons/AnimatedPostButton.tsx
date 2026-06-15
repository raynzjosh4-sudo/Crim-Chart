import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, Easing } from 'react-native-reanimated';

interface AnimatedPostButtonProps {
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
  const [isPosting, setIsPosting] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  const handlePress = async () => {
    if (isPosting) return;
    
    // Press animation
    scale.value = withTiming(0.95, { duration: 100, easing: Easing.inOut(Easing.ease) }, () => {
      scale.value = withTiming(1, { duration: 100 });
    });

    setIsPosting(true);
    try {
      await onPress();
    } finally {
      // Small delay so the user sees the completion before it vanishes
      setTimeout(() => setIsPosting(false), 300);
    }
  };

  return (
    <Animated.View style={[animatedStyle, style, isPosting && styles.postingContainer]}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handlePress}
        disabled={isPosting}
        activeOpacity={0.8}
      >
        {isPosting ? (
          <ActivityIndicator size="small" color={textStyle?.color || "#FFF"} />
        ) : (
          <Text style={[styles.text, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  postingContainer: {
    opacity: 0.8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  }
});
