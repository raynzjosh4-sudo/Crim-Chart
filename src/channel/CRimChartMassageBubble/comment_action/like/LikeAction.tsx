import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
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
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    if (onLikeTap) {
      onLikeTap();
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleLike} activeOpacity={0.7}>
      <Heart size={24} color={isLiked ? '#FF3B30' : '#FFFFFF'} fill={isLiked ? '#FF3B30' : 'transparent'} />
      <Text style={styles.text}>{likesCount}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
