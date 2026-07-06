import { useStyles } from '@/core/hooks/useStyles';
import { Image } from 'expo-image';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, View } from 'react-native';

interface VideoTrimmerTimelineProps {
  videoUri: string;
  durationSeconds: number;
  startTime: number;
  endTime: number;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  onScrubbingStart?: () => void;
  onScrubbingEnd?: () => void;
}

export const VideoTrimmerTimeline: React.FC<VideoTrimmerTimelineProps> = ({
  videoUri,
  durationSeconds,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onScrubbingStart,
  onScrubbingEnd,
}) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);

  const THUMBNAIL_COUNT = 8;
  const HANDLE_WIDTH = 20;

  const styles = useStyles((colors, scale) => ({
    container: {
      height: 60 * scale,
      width: '100%',
      backgroundColor: '#000',
      position: 'relative',
    },
    thumbnailsRow: {
      flexDirection: 'row',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      borderRadius: 8 * scale,
    },
    thumbnail: {
      flex: 1,
      height: '100%',
    },
    dimmingOverlayLeft: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    dimmingOverlayRight: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    trimBorderContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      borderTopWidth: 4 * scale,
      borderBottomWidth: 4 * scale,
      borderColor: '#FFFFFF',
      justifyContent: 'center',
    },
    handleLeft: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: HANDLE_WIDTH,
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 8 * scale,
      borderBottomLeftRadius: 8 * scale,
      justifyContent: 'center',
      alignItems: 'center',
    },
    handleRight: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: HANDLE_WIDTH,
      backgroundColor: '#FFFFFF',
      borderTopRightRadius: 8 * scale,
      borderBottomRightRadius: 8 * scale,
      justifyContent: 'center',
      alignItems: 'center',
    },
    handleGrip: {
      width: 2 * scale,
      height: 20 * scale,
      backgroundColor: '#000',
      borderRadius: 1 * scale,
    }
  }));

  // Fetch thumbnails
  useEffect(() => {
    let isMounted = true;
    const fetchThumbnails = async () => {
      if (!videoUri || durationSeconds <= 0) return;
      try {
        const interval = durationSeconds / THUMBNAIL_COUNT;
        const promises = Array.from({ length: THUMBNAIL_COUNT }).map((_, i) =>
          VideoThumbnails.getThumbnailAsync(videoUri, {
            time: Math.floor(i * interval * 1000), // ms
            quality: 0.5,
          })
        );
        const results = await Promise.all(promises);
        if (isMounted) {
          setThumbnails(results.map((r) => r.uri));
        }
      } catch (e) {
        console.warn('Failed to generate video thumbnails', e);
      }
    };
    fetchThumbnails();
    return () => { isMounted = false; };
  }, [videoUri, durationSeconds]);

  // Animation values for the handles
  const leftX = useRef(new Animated.Value(0)).current;
  const rightX = useRef(new Animated.Value(0)).current;

  // Sync animation values when container width or external props change (initially)
  useEffect(() => {
    if (containerWidth > 0 && durationSeconds > 0) {
      const initialLeftX = (startTime / durationSeconds) * containerWidth;
      const initialRightX = (endTime / durationSeconds) * containerWidth;
      leftX.setValue(initialLeftX);
      rightX.setValue(initialRightX);
    }
  }, [containerWidth, durationSeconds]);

  // Keep track of current positions without having to add listener state
  const leftXVal = useRef(0);
  const rightXVal = useRef(containerWidth); // Init to full width conceptually

  useEffect(() => {
    leftXVal.current = (startTime / durationSeconds) * containerWidth || 0;
    rightXVal.current = (endTime / durationSeconds) * containerWidth || containerWidth;
  }, [startTime, endTime, durationSeconds, containerWidth]);

  leftX.addListener(({ value }) => { leftXVal.current = value; });
  rightX.addListener(({ value }) => { rightXVal.current = value; });

  const MIN_GAP = 20; // Minimum pixel distance between left and right handles

  const leftGestureStart = useRef(0);
  const rightGestureStart = useRef(0);

  const leftResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        onScrubbingStart?.();
        leftGestureStart.current = leftXVal.current;
        leftX.setOffset(leftXVal.current);
        leftX.setValue(0);
      },
      onPanResponderMove: (e, gestureState) => {
        let newX = gestureState.dx;
        if (leftGestureStart.current + newX < 0) {
          newX = -leftGestureStart.current;
        }
        if (leftGestureStart.current + newX > rightXVal.current - MIN_GAP) {
          newX = rightXVal.current - MIN_GAP - leftGestureStart.current;
        }
        leftX.setValue(newX);
      },
      onPanResponderRelease: () => {
        leftX.flattenOffset();
        onScrubbingEnd?.();
        if (containerWidth > 0) {
          const newStartTime = (leftXVal.current / containerWidth) * durationSeconds;
          onStartTimeChange(Math.max(0, newStartTime));
        }
      },
    })
  ).current;

  const rightResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        onScrubbingStart?.();
        rightGestureStart.current = rightXVal.current;
        rightX.setOffset(rightXVal.current);
        rightX.setValue(0);
      },
      onPanResponderMove: (e, gestureState) => {
        let newX = gestureState.dx;
        if (rightGestureStart.current + newX > containerWidth) {
          newX = containerWidth - rightGestureStart.current;
        }
        if (rightGestureStart.current + newX < leftXVal.current + MIN_GAP) {
          newX = leftXVal.current + MIN_GAP - rightGestureStart.current;
        }
        rightX.setValue(newX);
      },
      onPanResponderRelease: () => {
        rightX.flattenOffset();
        onScrubbingEnd?.();
        if (containerWidth > 0) {
          const newEndTime = (rightXVal.current / containerWidth) * durationSeconds;
          onEndTimeChange(Math.min(durationSeconds, newEndTime));
        }
      },
    })
  ).current;

  if (durationSeconds <= 0) return null;

  return (
    <View
      style={styles.container}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Background thumbnails */}
      <View style={styles.thumbnailsRow}>
        {thumbnails.length > 0 ? (
          thumbnails.map((uri, index) => (
            <View key={index} style={styles.thumbnail}>
              <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            </View>
          ))
        ) : (
          <View style={styles.thumbnail} /> // Empty placeholder until loaded
        )}
      </View>

      {/* Dimming overlay outside trim bounds */}
      <Animated.View style={[styles.dimmingOverlayLeft, { width: leftX }]} />
      <Animated.View style={[styles.dimmingOverlayRight, { left: rightX }]} />

      {/* The White Border denoting the active trim region */}
      <Animated.View
        style={[
          styles.trimBorderContainer,
          {
            left: Animated.add(leftX, HANDLE_WIDTH),
            right: Animated.subtract(containerWidth, Animated.subtract(rightX, HANDLE_WIDTH)) // We want the right bound to be attached to rightX. Wait, right: width - rightX is better
          }
        ]}
      />

      {/* Absolute positioning for borders */}
      <Animated.View style={[
        { position: 'absolute', top: 0, bottom: 0, borderTopWidth: 4, borderBottomWidth: 4, borderColor: '#FFF' },
        { left: leftX, right: Animated.subtract(containerWidth, rightX) }
      ]} pointerEvents="none" />

      {/* Left Handle */}
      <Animated.View
        style={[styles.handleLeft, { left: Animated.subtract(leftX, HANDLE_WIDTH / 2) }]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        {...leftResponder.panHandlers}
      >
        <View style={styles.handleGrip} />
      </Animated.View>

      {/* Right Handle */}
      <Animated.View
        style={[styles.handleRight, { left: Animated.subtract(rightX, HANDLE_WIDTH / 2) }]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        {...rightResponder.panHandlers}
      >
        <View style={styles.handleGrip} />
      </Animated.View>

    </View>
  );
};
