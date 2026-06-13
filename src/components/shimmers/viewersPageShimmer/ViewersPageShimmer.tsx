import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
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
        { width, height, borderRadius, backgroundColor: 'rgba(255,255,255,0.1)' },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const ViewersPageShimmer = () => {
  // Render 10 dummy tiles for the loading state
  const dummyTiles = Array.from({ length: 10 }).map((_, index) => index);

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyTiles}
        keyExtractor={(item) => item.toString()}
        renderItem={() => (
          <View style={styles.tileContainer}>
            {/* Avatar Shimmer */}
            <View style={styles.avatarContainer}>
              <ShimmerElement width={50} height={50} borderRadius={25} />
            </View>

            {/* Info Shimmer */}
            <View style={styles.infoContainer}>
              <ShimmerElement width={120} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
              <ShimmerElement width={70} height={12} borderRadius={4} />
            </View>

            {/* Trailing Icon Shimmer */}
            <View style={styles.trailingContainer}>
              <ShimmerElement width={20} height={20} borderRadius={10} />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  avatarContainer: {
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  trailingContainer: {
    paddingLeft: 8,
    justifyContent: 'center',
  },
});
