import React, { useState, useRef, useEffect } from 'react';
import { View, Image, Animated, Easing, StyleSheet } from 'react-native';

interface GiftBubbleAnimationProps {
  startOffset: { x: number; y: number };
  imageUrl: string;
  onComplete: () => void;
}

export const GiftBubbleAnimation: React.FC<GiftBubbleAnimationProps> = ({
  startOffset,
  imageUrl,
  onComplete,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  // Generate random angle and distance once
  const randomParams = useRef({
    angle: Math.random() * 2 * Math.PI,
    distance: 100 + Math.random() * 100,
  }).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      onComplete();
    });
  }, [animValue, onComplete]);

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.cos(randomParams.angle) * randomParams.distance],
  });

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.sin(randomParams.angle) * randomParams.distance],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.15, 0.5, 1],
    outputRange: [0, 1, 1, 0],
  });

  const scale = animValue.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.2, 1.2, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: startOffset.x - 15,
          top: startOffset.y - 15,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
      pointerEvents="none"
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 30,
    height: 30,
    zIndex: 999,
  },
  image: {
    width: 30,
    height: 30,
  },
});
