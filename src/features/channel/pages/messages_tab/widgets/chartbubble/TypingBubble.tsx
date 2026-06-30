import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import AppAvatar from '@/components/avatar/AppAvatar';

const BouncingDots = () => {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounce = (anim: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: -5, duration: 300, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.delay(600),
          ])
        )
      ]);
    };

    Animated.parallel([
      createBounce(anim1, 0),
      createBounce(anim2, 200),
      createBounce(anim3, 400),
    ]).start();
  }, []);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { transform: [{ translateY: anim1 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: anim2 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: anim3 }] }]} />
    </View>
  );
};

interface TypingBubbleProps {
  avatarUrl: string;
}

export const TypingBubble: React.FC<TypingBubbleProps> = ({ avatarUrl }) => {
  return (
    <View style={styles.container}>
      <AppAvatar
        url={avatarUrl}
        size={42}
        showStatusRing={false}
      />
      <View style={styles.spacer} />
      <View style={styles.bubble}>
        <BouncingDots />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  spacer: {
    width: 12,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
    height: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginHorizontal: 3,
  },
});
