import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const CompactPaginationSkeleton = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <View style={styles.miniCard}>
        <View style={styles.header}>
          <Animated.View style={[styles.avatar, { opacity }]} />
          <View style={styles.nameContainer}>
            <Animated.View style={[styles.textLine, { width: 80, opacity }]} />
            <Animated.View style={[styles.textLine, { width: 50, height: 6, marginTop: 4, opacity }]} />
          </View>
        </View>

        {/* Mini Video Placeholder (16:9 aspect ratio) */}
        <Animated.View style={[styles.videoPlaceholder, { opacity }]} />

        <View style={styles.footer}>
          <Animated.View style={[styles.actionDot, { opacity }]} />
          <Animated.View style={[styles.actionDot, { opacity }]} />
          <Animated.View style={[styles.actionDot, { opacity }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    width: '100%',
  },
  miniCard: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    marginRight: 8,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  textLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2A2A2A',
  },
  videoPlaceholder: {
    width: '100%',
    height: 120, // Strict height for mini video layout
    backgroundColor: '#1A1A1A',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  actionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2A2A2A',
  },
});
