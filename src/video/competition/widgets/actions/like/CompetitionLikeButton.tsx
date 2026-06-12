import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';

interface CompetitionLikeButtonProps {
  isLiked: boolean;
  onPress: () => void;
}

export const CompetitionLikeButton: React.FC<CompetitionLikeButtonProps> = ({ isLiked, onPress }) => (
  <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.75}>
    <Heart color={isLiked ? '#FF5252' : '#FFF'} size={28} fill={isLiked ? '#FF5252' : 'none'} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: { padding: 8 },
});
