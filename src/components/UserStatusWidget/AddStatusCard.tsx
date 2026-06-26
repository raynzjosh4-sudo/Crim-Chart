import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AppAvatar from '@/components/avatar/AppAvatar';
import { useAppTheme } from '@/core/theme/app_theme';
import { Plus } from 'lucide-react-native';

export interface AddStatusCardProps {
  avatarUrl?: string | null;
  onPress?: () => void;
}

export const AddStatusCard: React.FC<AddStatusCardProps> = ({ avatarUrl, onPress }) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
      <View style={styles.avatarContainer}>
        <AppAvatar imageUrl={avatarUrl} size={48} showStatusRing={false} />
        <View style={[styles.plusBadge, { backgroundColor: colors.primary }]}>
          <Plus size={14} color="#000" strokeWidth={3} />
        </View>
      </View>

      <Text style={styles.text} numberOfLines={1}>
        Add status
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    position: 'relative',
  },
  avatarContainer: {
    marginTop: 24,
    position: 'relative',
  },
  plusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#1E1E1E', // Match container background
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    position: 'absolute',
    bottom: 12,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 8,
    textAlign: 'center',
  },
});
