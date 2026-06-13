import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const ShimmerElement = ({ width, height, borderRadius = 4, style }: any) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: '#2A2A2A' },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const InboxDetailShimmer = () => {
  // Render a mix of "me" and "them" dummy messages
  const dummyMessages = [
    { id: 5, isMe: true, lines: 1 },
    { id: 4, isMe: false, lines: 2 },
    { id: 3, isMe: false, lines: 1 },
    { id: 2, isMe: true, lines: 3 },
    { id: 1, isMe: false, lines: 2 },
  ];

  return (
    <View style={styles.container}>
      {dummyMessages.map((msg) => (
        <View key={msg.id}>
          <View style={[styles.contentRow, msg.isMe ? styles.rowReverse : styles.rowForward]}>
            <ShimmerElement width={42} height={42} borderRadius={21} />
            <View style={styles.spacer} />
            <View style={[styles.contentColumn, msg.isMe ? styles.alignEnd : styles.alignStart]}>
              <View style={[styles.headerRow, msg.isMe ? styles.rowReverse : styles.rowForward]}>
                <ShimmerElement width={80} height={12} borderRadius={4} />
                <View style={{ width: 8 }} />
                <ShimmerElement width={40} height={10} borderRadius={4} />
              </View>
              
              <View style={[styles.bubbleContainer, msg.isMe ? styles.alignEnd : styles.alignStart]}>
                {Array.from({ length: msg.lines }).map((_, i) => (
                  <ShimmerElement 
                    key={i} 
                    width={msg.lines === 1 ? 140 : (i === msg.lines - 1 ? 100 : 200)} 
                    height={16} 
                    borderRadius={4} 
                    style={{ marginTop: 6 }} 
                  />
                ))}
              </View>
            </View>
          </View>
          <View style={styles.divider} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  rowForward: {
    flexDirection: 'row',
  },
  spacer: {
    width: 12,
  },
  contentColumn: {
    flex: 1,
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bubbleContainer: {
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
