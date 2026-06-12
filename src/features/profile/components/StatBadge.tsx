import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/core/theme/colors';

interface StatBadgeProps {
  label: string;
  value: string;
  isHighlighted?: boolean;
}

export const StatBadge: React.FC<StatBadgeProps> = ({ label, value, isHighlighted = false }) => {
  return (
    <View style={[
      styles.container,
      isHighlighted && styles.containerHighlighted
    ]}>
      <Text style={[
        styles.value,
        isHighlighted && styles.valueHighlighted
      ]}>
        {value}
      </Text>
      <Text style={[
        styles.label,
        isHighlighted && styles.labelHighlighted
      ]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  containerHighlighted: {
    backgroundColor: 'rgba(255, 179, 0, 0.05)',
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  valueHighlighted: {
    color: colors.primary,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  labelHighlighted: {
    color: 'rgba(255, 179, 0, 0.7)',
  },
});
