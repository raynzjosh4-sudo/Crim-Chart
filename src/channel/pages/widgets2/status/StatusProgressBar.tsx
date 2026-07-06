import { useStyles } from "@/core/hooks/useStyles";
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, cancelAnimation, Easing, runOnJS } from 'react-native-reanimated';
interface StatusProgressBarProps {
  count: number;
  currentIndex: number;
  duration?: number;
  isPaused: boolean;
  onComplete: () => void;
}
export const StatusProgressBar: React.FC<StatusProgressBarProps> = ({
  count,
  currentIndex,
  duration = 5000,
  isPaused,
  onComplete
}) => {
  const styles = useStyles(colors => ({
    container: {
      flexDirection: 'row',
      width: '100%',
      paddingHorizontal: 8,
      paddingTop: 12
    },
    segmentContainer: {
      flex: 1,
      height: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      marginHorizontal: 2,
      borderRadius: 2,
      overflow: 'hidden'
    },
    segmentFill: {
      height: '100%',
      backgroundColor: colors.text
    }
  }));
  return <View style={styles.container}>
      {Array.from({
      length: count
    }).map((_, index) => <ProgressSegment key={index} index={index} currentIndex={currentIndex} duration={duration} isPaused={isPaused} onComplete={onComplete} />)}
    </View>;
};
interface ProgressSegmentProps {
  key?: React.Key;
  index: number;
  currentIndex: number;
  duration: number;
  isPaused: boolean;
  onComplete: () => void;
}
const ProgressSegment: React.FC<ProgressSegmentProps> = ({
  index,
  currentIndex,
  duration,
  isPaused,
  onComplete
}) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    if (index < currentIndex) {
      // Already completed
      progress.value = 1;
    } else if (index === currentIndex) {
      // Currently active
      if (!isPaused) {
        // Start or resume animation
        progress.value = withTiming(1, {
          duration: duration * (1 - progress.value),
          // Adjust for remaining time
          easing: Easing.linear
        }, finished => {
          if (finished) {
            runOnJS(onComplete)();
          }
        });
      } else {
        // Pause animation
        cancelAnimation(progress);
      }
    } else {
      // Not yet reached
      progress.value = 0;
    }
  }, [index, currentIndex, isPaused, duration]);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`
    };
  });
  return <View style={styles.segmentContainer}>
      <Animated.View style={[styles.segmentFill, animatedStyle]} />
    </View>;
};