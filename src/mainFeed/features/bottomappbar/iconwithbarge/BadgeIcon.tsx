import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface BadgeIconProps {
  IconComponent: LucideIcon;
  count?: number;
  showDot?: boolean;
  color?: string;
  size?: number;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({ IconComponent, count = 0, showDot = false, color, size = 24 }) => {
  return (
    <View style={styles.container}>
      <IconComponent color={color} size={size} />
      {(count > 0 || showDot) && (
        <View style={[styles.badge, count === 0 && showDot && styles.dotOnly]}>
          {count > 0 && (
            <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF5252',
    borderRadius: 12,
    minWidth: 22,
    minHeight: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#000',
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  dotOnly: {
    minWidth: 12,
    minHeight: 12,
    top: 0,
    right: -2,
  },
  text: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
});
