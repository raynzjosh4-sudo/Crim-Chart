import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

const AnimatedShimmerBlock = ({ width, height, borderRadius, style }: any) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

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
        })
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]
  });

  return (
    <Animated.View
      style={[
        styles.shimmerBlock,
        { width, height, borderRadius, opacity },
        style
      ]}
    />
  );
};

export const MoviePostingItemShimmer = () => {
  return (
    <View style={styles.itemContainer}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedShimmerBlock width={44} height={44} borderRadius={22} />
        <View style={styles.headerText}>
          <AnimatedShimmerBlock width={120} height={14} borderRadius={4} />
          <AnimatedShimmerBlock width={180} height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
        <AnimatedShimmerBlock width={60} height={28} borderRadius={14} style={{ marginLeft: 'auto' }} />
      </View>

      {/* Video Thumbnail (3/4 ratio) */}
      <View style={styles.thumbnailContainer}>
        <AnimatedShimmerBlock width="100%" height={width * (4 / 3)} borderRadius={0} />
      </View>

      {/* Video Info */}
      <View style={styles.info}>
        <AnimatedShimmerBlock width={200} height={18} borderRadius={4} />
        <AnimatedShimmerBlock width={80} height={14} borderRadius={4} style={{ marginTop: 6 }} />
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <AnimatedShimmerBlock width={40} height={20} borderRadius={4} />
        <AnimatedShimmerBlock width={40} height={20} borderRadius={4} style={{ marginLeft: 24 }} />
        <AnimatedShimmerBlock width={60} height={28} borderRadius={14} style={{ marginLeft: 'auto' }} />
      </View>
    </View>
  );
};

export const MoviePostingPageShimmer = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <MoviePostingItemShimmer />
      <MoviePostingItemShimmer />
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: 24,
    backgroundColor: '#000',
  },
  shimmerBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerText: {
    marginLeft: 10,
    flex: 1,
  },
  thumbnailContainer: {
    width: '100%',
    marginBottom: 12,
  },
  info: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  }
});
