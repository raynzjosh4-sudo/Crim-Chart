import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const MainFeedSkeletonCard = () => {
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
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Animated.View style={[styles.avatar, { opacity }]} />
          <View style={styles.nameContainer}>
            <Animated.View style={[styles.textLine, { width: 120, opacity }]} />
            <Animated.View style={[styles.textLine, { width: 80, height: 10, marginTop: 6, opacity }]} />
          </View>
        </View>
        <Animated.View style={[styles.dots, { opacity }]} />
      </View>

      <Animated.View style={[styles.mediaPlaceholder, { opacity }]} />

      <View style={styles.actionBar}>
        <View style={styles.actionLeft}>
          <Animated.View style={[styles.actionIcon, { opacity }]} />
          <Animated.View style={[styles.actionIcon, { opacity }]} />
          <Animated.View style={[styles.actionIcon, { opacity }]} />
        </View>
        <Animated.View style={[styles.actionIcon, { opacity }]} />
      </View>

      <View style={styles.captionArea}>
        <Animated.View style={[styles.textLine, { width: '90%', opacity }]} />
        <Animated.View style={[styles.textLine, { width: '60%', marginTop: 8, opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#000',
    marginBottom: 20,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    marginRight: 12,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  textLine: {
    height: 14,
    borderRadius: 4,
    backgroundColor: '#2A2A2A',
  },
  dots: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2A2A2A',
  },
  mediaPlaceholder: {
    width: '100%',
    aspectRatio: 1, 
    backgroundColor: '#1A1A1A',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    gap: 20,
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2A2A2A',
  },
  captionArea: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
