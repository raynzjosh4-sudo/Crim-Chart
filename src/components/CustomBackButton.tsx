import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../core/theme/colors';

interface CustomBackButtonProps {
  onPressed: () => void;
  color?: string;
  size?: number;
}

export const CustomBackButton: React.FC<CustomBackButtonProps> = ({
  onPressed,
  color = colors.text,
  size = 30,
}) => {
  return (
    <TouchableOpacity 
      onPress={onPressed} 
      style={styles.container}
      activeOpacity={0.7}
    >
      <ChevronLeft size={size} color={color} strokeWidth={2.5} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
