import React, { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const ActivityShimmer = () => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((key) => (
        <View key={key} style={styles.itemContainer}>
          <Animated.View style={[styles.avatarShimmer, { opacity }]} />
          <View style={styles.textContainer}>
            <Animated.View style={[styles.textLine, { opacity, width: '60%' }]} />
            <Animated.View style={[styles.textLine, { opacity, width: '40%', marginTop: 8 }]} />
          </View>
        </View>
      ))}
    </View>
  );
};

export const PaginationShimmer = () => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.paginationContainer}>
      <Animated.View style={[styles.paginationDot, { opacity }]} />
      <Animated.View style={[styles.paginationDot, { opacity }]} />
      <Animated.View style={[styles.paginationDot, { opacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarShimmer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textLine: {
    height: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
});
