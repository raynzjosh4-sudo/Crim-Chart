import { useCurrentTheme } from "@/core/store/useThemeStore";
import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
interface CompetitionLikeButtonProps {
  isLiked: boolean;
  onPress: () => void;
}
export const CompetitionLikeButton: React.FC<CompetitionLikeButtonProps> = ({
  isLiked,
  onPress
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(colors => ({
    btn: {
      padding: 8
    }
  }));
  return <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.75}>
    <Heart color={isLiked ? '#FF5252' : theme.colors.text} size={28} fill={isLiked ? '#FF5252' : 'none'} />
  </TouchableOpacity>;
};