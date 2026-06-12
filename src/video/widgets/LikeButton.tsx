import React, { useRef, useState, useEffect } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Heart } from 'lucide-react-native';

interface LikeButtonProps {
  initialLikes: number;
  isLiked?: boolean;
  onTap?: () => void;
}

export const LikeButton = ({ initialLikes, isLiked = false, onTap }: LikeButtonProps) => {
  const [liked, setLiked] = useState<boolean>(isLiked);
  const [likes, setLikes] = useState<number>(initialLikes);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setLiked(isLiked);
    setLikes(initialLikes);
  }, [initialLikes, isLiked]);

  const handleTap = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    
    if (newLiked) {
      setLikes(likes + 1);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.4,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      setLikes(Math.max(0, likes - 1));
    }
    
    if (onTap) onTap();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleTap} activeOpacity={0.8}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Heart 
          size={38} 
          color={liked ? '#E91E63' : '#FFF'} 
          fill={liked ? '#E91E63' : 'transparent'} 
        />
      </Animated.View>
      <Text style={styles.countText}>{likes}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
});
