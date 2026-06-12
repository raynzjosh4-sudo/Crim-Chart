import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface AnimatedSendButtonProps {
  onTap: () => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
  color: string;
  size?: number;
  Icon: LucideIcon;
  style?: ViewStyle;
}

export default function AnimatedSendButton({
  onTap,
  onLongPressStart,
  onLongPressEnd,
  color,
  size = 20,
  Icon,
  style,
}: AnimatedSendButtonProps) {
  // Animation values
  const shakeX = useRef(new Animated.Value(0)).current;
  const shakeRotation = useRef(new Animated.Value(0)).current;

  const rocketX = useRef(new Animated.Value(0)).current;
  const rocketY = useRef(new Animated.Value(0)).current;
  const rocketOpacity = useRef(new Animated.Value(1)).current;

  const isInteracting = useRef(false);
  const isLongPressed = useRef(false);
  const [isLongPressedState, setIsLongPressedState] = useState(false);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);

  const stopAnimations = useCallback(() => {
    isInteracting.current = true;
    shakeX.stopAnimation();
    shakeRotation.stopAnimation();
    rocketX.stopAnimation();
    rocketY.stopAnimation();
    rocketOpacity.stopAnimation();
    shakeX.setValue(0);
    shakeRotation.setValue(0);
    rocketX.setValue(0);
    rocketY.setValue(0);
    rocketOpacity.setValue(1);
  }, []);

  const resumeAnimations = useCallback(() => {
    isInteracting.current = false;
  }, []);

  const runShakeSequence = useCallback(async () => {
    if (isInteracting.current) return;
    // 3 complete left/right shakes with slight rotation
    await new Promise<void>(resolve => {
      Animated.sequence([
        // shake 1
        Animated.parallel([
          Animated.sequence([
            Animated.timing(shakeX, { toValue: 4, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: -4, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: 4, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: -4, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: 4, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: -4, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(shakeRotation, { toValue: 0.08, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeRotation, { toValue: -0.08, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeRotation, { toValue: 0.08, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeRotation, { toValue: 0, duration: 100, useNativeDriver: true }),
          ]),
        ]),
      ]).start(() => {
        shakeX.setValue(0);
        shakeRotation.setValue(0);
        resolve();
      });
    });
  }, []);

  const runRocketSequence = useCallback(async () => {
    if (isInteracting.current) return;
    await new Promise<void>(resolve => {
      // Phase 1: fly out top-right + fade out (0–40%)
      Animated.parallel([
        Animated.timing(rocketX, { toValue: 60, duration: 480, useNativeDriver: true }),
        Animated.timing(rocketY, { toValue: -60, duration: 480, useNativeDriver: true }),
        Animated.timing(rocketOpacity, { toValue: 0, duration: 480, useNativeDriver: true }),
      ]).start(() => {
        if (isInteracting.current) return resolve();
        // Snap to bottom-left, invisible
        rocketX.setValue(-60);
        rocketY.setValue(60);
        // Phase 2: fly in from bottom-left + fade in (60–100%)
        Animated.parallel([
          Animated.timing(rocketX, { toValue: 0, duration: 480, easing: (t) => 1 - Math.pow(1 - t, 3), useNativeDriver: true }),
          Animated.timing(rocketY, { toValue: 0, duration: 480, easing: (t) => 1 - Math.pow(1 - t, 3), useNativeDriver: true }),
          Animated.timing(rocketOpacity, { toValue: 1, duration: 480, useNativeDriver: true }),
        ]).start(() => resolve());
      });
    });
  }, []);

  const startCycle = useCallback(() => {
    // Initial shake after 2s
    const initialDelay = setTimeout(() => {
      if (!isInteracting.current) runShakeSequence();
    }, 2000);

    cycleRef.current = setInterval(() => {
      if (isInteracting.current) return;
      if (stepRef.current === 0) {
        runRocketSequence();
        stepRef.current = 1;
      } else {
        runShakeSequence();
        stepRef.current = 0;
      }
    }, 60_000); // Every minute

    return () => clearTimeout(initialDelay);
  }, [runShakeSequence, runRocketSequence]);

  useEffect(() => {
    const cleanup = startCycle();
    return () => {
      cleanup?.();
      if (cycleRef.current) clearInterval(cycleRef.current);
    };
  }, []);

  const animatedStyle = {
    transform: [
      { translateX: Animated.add(shakeX, rocketX) },
      { translateY: rocketY },
      { rotate: shakeRotation.interpolate({ inputRange: [-1, 1], outputRange: ['-57.29deg', '57.29deg'] }) },
    ],
    opacity: rocketOpacity,
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={() => {
        stopAnimations();
      }}
      onPressOut={() => {
        if (!isLongPressed.current) {
          onTap();
        }
        resumeAnimations();
      }}
      onLongPress={() => {
        isLongPressed.current = true;
        setIsLongPressedState(true);
        onLongPressStart?.();
      }}
      onPress={() => {
        // handled in onPressOut
      }}
      delayLongPress={400}
    >
      <View style={[styles.wrapper, style]}>
        <Animated.View style={animatedStyle}>
          <Icon color={color} size={size} />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
