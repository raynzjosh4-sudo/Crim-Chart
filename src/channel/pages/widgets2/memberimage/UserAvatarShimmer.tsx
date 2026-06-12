import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

interface UserAvatarShimmerProps {
  width?: number | string;
  height?: number | string;
  shape?: 'circle' | 'rectangle';
  borderRadius?: number;
  style?: ViewStyle;
}

export const UserAvatarShimmer: React.FC<UserAvatarShimmerProps> = ({
  width = 50,
  height = 50,
  shape = 'circle',
  borderRadius = 8,
  style,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [anim]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.shimmer,
        {
          width,
          height,
          borderRadius: shape === 'circle' ? 999 : borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  shimmer: {
    backgroundColor: '#333333', // surface container highest roughly
  },
});
