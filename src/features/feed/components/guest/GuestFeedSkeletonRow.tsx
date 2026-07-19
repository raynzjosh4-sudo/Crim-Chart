import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useAppTheme } from '@/core/theme/app_theme';

const ShimmerBox = ({ width, height, borderRadius = 8 }: { width: number | string; height: number; borderRadius?: number }) => {
  const { colors } = useAppTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] });

  return (
    <Animated.View
      style={{
        width: width as any,
        height,
        borderRadius,
        backgroundColor: colors.textSecondary ?? '#555',
        opacity,
      }}
    />
  );
};

export const GuestFeedSkeletonRow = React.memo(() => {
  return (
    <View style={styles.container}>
      {/* Header shimmer */}
      <View style={styles.header}>
        <ShimmerBox width={40} height={40} borderRadius={20} />
        <ShimmerBox width={120} height={14} borderRadius={7} />
        <ShimmerBox width={68} height={28} borderRadius={14} />
      </View>

      {/* Cards shimmer */}
      <View style={styles.cards}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.card}>
            <ShimmerBox width={148} height={148} borderRadius={16} />
            <View style={{ marginTop: 8 }}>
              <ShimmerBox width={120} height={12} borderRadius={6} />
              <View style={{ height: 6 }} />
              <ShimmerBox width={80} height={10} borderRadius={5} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cards: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    width: 148,
  },
});
