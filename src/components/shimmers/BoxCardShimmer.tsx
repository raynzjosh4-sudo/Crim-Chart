import { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const BoxCardShimmer = () => {
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
    <View style={styles.cardContainer}>
      <Animated.View style={[styles.coverContainer, { opacity }]} />
      <View style={styles.infoContainer}>
        <Animated.View style={[styles.titleShimmer, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 140,
    marginRight: 12,
  },
  coverContainer: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  infoContainer: {
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  titleShimmer: {
    width: 100,
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 4,
  },
});
