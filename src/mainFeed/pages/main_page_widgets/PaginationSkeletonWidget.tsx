import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export const PaginationSkeletonWidget = () => {
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
    outputRange: [0.2, 0.6],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.titleShimmer, { opacity }]} />
      </View>
      <View style={styles.scrollContent}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Animated.View key={i} style={[styles.cardShimmer, { opacity }]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    width: '100%',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleShimmer: {
    width: 140,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
  },
  scrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  cardShimmer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * (16 / 9),
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
});
