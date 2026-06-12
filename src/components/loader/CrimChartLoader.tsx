import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ProgressBar } from 'react-native-paper'; // A common RN progress bar, or can use default ActivityIndicator
import { useTheme } from '@react-navigation/native';

interface ChartLinearLoaderProps {
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export const ChartLoader: React.FC<ChartLinearLoaderProps> = ({
  height = 2.5,
  color,
  backgroundColor = 'transparent',
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      <View style={[styles.clip, { borderRadius: height / 2 }]}>
        <ProgressBar
          indeterminate
          color={color || colors.primary}
          style={{ height, backgroundColor }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  clip: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
});
