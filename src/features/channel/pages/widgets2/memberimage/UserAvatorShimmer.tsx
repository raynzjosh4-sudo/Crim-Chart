import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, DimensionValue } from 'react-native';

interface ThemeShimmerProps {
  width?: DimensionValue;
  height?: DimensionValue;
  shape?: 'rectangle' | 'circle';
  borderRadius?: number;
}

export const ThemeShimmer: React.FC<ThemeShimmerProps> = ({
  width = '100%',
  height = '100%',
  shape = 'rectangle',
  borderRadius,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.shimmer,
        { width, height, opacity },
        shape === 'circle' ? styles.circle : { borderRadius: borderRadius ?? 8 },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  shimmer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle: {
    borderRadius: 9999,
  },
});
