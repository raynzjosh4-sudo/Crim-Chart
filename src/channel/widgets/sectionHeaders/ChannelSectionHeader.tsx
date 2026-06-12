import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/core/theme/colors';

interface ChannelSectionHeaderProps {
  title: string;
  subtitle?: string;
  showAction?: boolean;
  actionText?: string;
  onActionPressed?: () => void;
}

export const ChannelSectionHeader: React.FC<ChannelSectionHeaderProps> = ({
  title,
  subtitle,
  showAction = true,
  actionText = 'See all',
  onActionPressed,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      
      {showAction && (
        <TouchableOpacity style={styles.actionBtn} onPress={onActionPressed}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 20,
    paddingRight: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF', // onSurface
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)', // onSurface opacity
    letterSpacing: -0.2,
    marginTop: 2,
  },
  actionBtn: {
    backgroundColor: '#2A2A2A', // surfaceContainerHighest
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
