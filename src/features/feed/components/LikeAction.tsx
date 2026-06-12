import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring, withSequence, useSharedValue } from 'react-native-reanimated';

interface LikeActionProps {
  initialLikes: number;
  initialIsLiked: boolean;
  onPress?: () => void;
}

export const LikeAction: React.FC<LikeActionProps> = ({ initialLikes, initialIsLiked, onPress }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likes, setLikes] = useState(initialLikes);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikes(prev => newLiked ? prev + 1 : prev - 1);
    
    scale.value = withSequence(
      withSpring(1.4),
      withSpring(1)
    );
    
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={animatedStyle}>
        <Heart 
          size={38} 
          color={isLiked ? '#FF4B4B' : '#FFF'} 
          fill={isLiked ? '#FF4B4B' : 'transparent'} 
        />
      </Animated.View>
      <Text style={styles.count}>{likes}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  count: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.54)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
