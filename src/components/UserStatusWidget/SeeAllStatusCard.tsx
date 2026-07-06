import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useAppTheme } from '@/core/theme/app_theme';

export interface SeeAllStatusCardProps {
  onPress?: () => void;
  count?: number;
}

export const SeeAllStatusCard: React.FC<SeeAllStatusCardProps> = ({ onPress, count }) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceVariant }]}>
        <ArrowRight size={24} color={colors.primary} />
      </View>
      <Text style={[styles.titleText, { color: colors.text }]}>See All</Text>
      {count !== undefined && count > 0 && (
        <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>+{count} more</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
});
