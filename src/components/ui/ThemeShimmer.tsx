import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/core/theme/colors';

interface ThemeShimmerProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  isCircle?: boolean;
}

export default function ThemeShimmer({
  width,
  height,
  borderRadius = 8,
  style,
  isCircle = false,
}: ThemeShimmerProps) {
  const translateX = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const baseColor = 'rgba(255,255,255,0.05)';
  const highlightColor = 'rgba(255,255,255,0.12)';

  const containerStyle: ViewStyle = {
    width: width as number | undefined,
    height: height as number | undefined,
    borderRadius: isCircle ? 9999 : borderRadius,
    overflow: 'hidden',
    backgroundColor: baseColor,
  };

  return (
    <View style={[containerStyle, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              {
                translateX: translateX.interpolate({
                  inputRange: [-1, 1],
                  outputRange: [-300, 300],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[baseColor, highlightColor, baseColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}
