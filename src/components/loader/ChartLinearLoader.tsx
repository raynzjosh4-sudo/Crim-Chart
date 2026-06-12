import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export interface ChartLinearLoaderProps {
  isLoading: boolean;
  color?: string;
  height?: number;
}

export const ChartLinearLoader: React.FC<ChartLinearLoaderProps> = ({
  isLoading,
  color = '#6E7BFF', // Chart primary (replaced gold)
  height = 3.2,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate height
    Animated.timing(heightAnim, {
      toValue: isLoading ? height : 0,
      duration: 300,
      useNativeDriver: false, // height cannot use native driver
    }).start();

    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: 0, // Reset instantly
            useNativeDriver: false,
          })
        ])
      ).start();
    } else {
      progressAnim.stopAnimation();
      progressAnim.setValue(0);
    }
  }, [isLoading, heightAnim, progressAnim, height]);

  const leftPosition = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-50%', '150%'],
  });

  return (
    <Animated.View style={[styles.container, { height: heightAnim, backgroundColor: color + '1A' }]}>
      {isLoading && (
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: color,
              left: leftPosition,
            },
          ]}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    width: '50%',
    height: '100%',
    position: 'absolute',
  },
});
