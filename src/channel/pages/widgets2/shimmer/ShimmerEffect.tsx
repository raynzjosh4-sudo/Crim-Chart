import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface ShimmerEffectProps {
  children: React.ReactNode;
  duration?: number;
  style?: ViewStyle;
}

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  children,
  duration = 1500,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity, duration]);

  return (
    <Animated.View style={[{ opacity }, style]}>
      {children}
    </Animated.View>
  );
};
