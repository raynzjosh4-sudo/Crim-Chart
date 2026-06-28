import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface VideoTimelineScrubberProps {
  duration: number; // total duration in ms
  onTrimChange: (startMs: number, endMs: number) => void;
}

const { width: SCREEN_W } = Dimensions.get('window');
const TRACK_WIDTH = SCREEN_W - 40;
const HANDLE_WIDTH = 20;

export const VideoTimelineScrubber: React.FC<VideoTimelineScrubberProps> = ({ duration, onTrimChange }) => {
  const startX = useSharedValue(0);
  const endX = useSharedValue(TRACK_WIDTH);

  const notifyChange = (sX: number, eX: number) => {
    const startMs = (sX / TRACK_WIDTH) * duration;
    const endMs = (eX / TRACK_WIDTH) * duration;
    onTrimChange(startMs, endMs);
  };

  const startHandleGesture = Gesture.Pan()
    .onChange((e) => {
      // Prevent crossing the end handle or going below 0
      const newX = Math.max(0, Math.min(startX.value + e.changeX, endX.value - HANDLE_WIDTH));
      startX.value = newX;
    })
    .onEnd(() => {
      runOnJS(notifyChange)(startX.value, endX.value);
    });

  const endHandleGesture = Gesture.Pan()
    .onChange((e) => {
      // Prevent crossing the start handle or going past TRACK_WIDTH
      const newX = Math.max(startX.value + HANDLE_WIDTH, Math.min(endX.value + e.changeX, TRACK_WIDTH));
      endX.value = newX;
    })
    .onEnd(() => {
      runOnJS(notifyChange)(startX.value, endX.value);
    });

  const trackStyle = useAnimatedStyle(() => ({
    left: startX.value,
    width: endX.value - startX.value,
  }));

  const startHandleStyle = useAnimatedStyle(() => ({
    left: startX.value,
  }));

  const endHandleStyle = useAnimatedStyle(() => ({
    left: endX.value - HANDLE_WIDTH,
  }));

  return (
    <View style={styles.container}>
      {/* Background Track */}
      <View style={styles.backgroundTrack} />

      {/* Active Selection Track */}
      <Animated.View style={[styles.activeTrack, trackStyle]} />

      {/* Start Handle */}
      <GestureDetector gesture={startHandleGesture}>
        <Animated.View style={[styles.handle, startHandleStyle]} />
      </GestureDetector>

      {/* End Handle */}
      <GestureDetector gesture={endHandleGesture}>
        <Animated.View style={[styles.handle, endHandleStyle]} />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: TRACK_WIDTH,
    height: 60,
    alignSelf: 'center',
    marginVertical: 20,
    justifyContent: 'center',
  },
  backgroundTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  activeTrack: {
    position: 'absolute',
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#fff',
  },
  handle: {
    position: 'absolute',
    width: HANDLE_WIDTH,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
});
