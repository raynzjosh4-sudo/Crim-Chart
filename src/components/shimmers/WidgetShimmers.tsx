import React, { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const TrendingShimmer = () => {
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
    <View style={trendingStyles.container}>
      {[1, 2, 3].map((key) => (
        <View key={key} style={trendingStyles.card}>
          <Animated.View style={[trendingStyles.image, { opacity }]} />
          <Animated.View style={[trendingStyles.textLine, { opacity, width: '80%', marginTop: 8 }]} />
          <Animated.View style={[trendingStyles.textLine, { opacity, width: '50%', marginTop: 4 }]} />
        </View>
      ))}
    </View>
  );
};

export const ContributorShimmer = () => {
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
    <View style={contributorStyles.container}>
      {[1, 2, 3, 4].map((key) => (
        <View key={key} style={contributorStyles.wrapper}>
          <Animated.View style={[contributorStyles.avatar, { opacity }]} />
          <Animated.View style={[contributorStyles.textLine, { opacity }]} />
        </View>
      ))}
    </View>
  );
};

const trendingStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  card: {
    width: 130,
    marginRight: 16,
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  textLine: {
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

const contributorStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  wrapper: {
    alignItems: 'center',
    marginRight: 16,
    width: 110,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  textLine: {
    width: 60,
    height: 12,
    marginTop: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
