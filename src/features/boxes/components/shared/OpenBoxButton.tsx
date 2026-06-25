import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface OpenBoxButtonProps {
  onPress: () => void;
  title?: string;
}

export const OpenBoxButton: React.FC<OpenBoxButtonProps> = ({ onPress, title = "Open Box" }) => {
  return (
    <TouchableOpacity activeOpacity={1} style={styles.smallOpenBtn} onPress={onPress}>
      <Text style={styles.smallOpenText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  smallOpenBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  smallOpenText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
