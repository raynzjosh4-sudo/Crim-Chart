import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface CommentActionProps {
  icon: LucideIcon;
  label: string;
  color?: string;
  onPress?: () => void;
}

export const CommentAction: React.FC<CommentActionProps> = ({ icon: Icon, label, color = '#FFF', onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Icon size={38} color={color} />
      <Text style={styles.count}>{label}</Text>
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
