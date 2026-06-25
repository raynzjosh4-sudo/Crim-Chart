import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonBoxProps {
  key?: string | number;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

// Shared animation value so all skeletons on screen shimmer in sync
let sharedAnim: Animated.Value | null = null;
let activeAnimations = 0;
let sharedAnimation: Animated.CompositeAnimation | null = null;

function getSharedAnim(): Animated.Value {
  if (!sharedAnim) {
    sharedAnim = new Animated.Value(0);
  }
  return sharedAnim;
}

function startSharedAnimation() {
  if (activeAnimations === 1 && sharedAnim) {
    sharedAnimation = Animated.loop(
      Animated.timing(sharedAnim, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
        isInteraction: false,
      })
    );
    sharedAnimation.start();
  }
}

function stopSharedAnimation() {
  if (activeAnimations === 0 && sharedAnimation) {
    sharedAnimation.stop();
    sharedAnimation = null;
    sharedAnim?.setValue(0);
  }
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 6,
  style,
}) => {
  const animRef = useRef(getSharedAnim());
  const theme = useCurrentTheme();

  useEffect(() => {
    activeAnimations++;
    startSharedAnimation();
    return () => {
      activeAnimations--;
      stopSharedAnimation();
    };
  }, []);

  // Shimmer translate — moves a 300-wide gradient across the element
  const translateX = animRef.current.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: theme.colors.surfaceVariant,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.07)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, width: 300 }}
        />
      </Animated.View>
    </View>
  );
};
