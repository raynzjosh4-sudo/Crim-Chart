import { useCurrentTheme } from "@/core/store/useThemeStore";
import { useStyles } from "@/core/hooks/useStyles";
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { ThemeTokens } from "@/core/theme/themes";

const { width } = Dimensions.get('window');

const themeStyles = (colors: ThemeTokens) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  itemContainer: {
    marginBottom: 16,
    backgroundColor: colors.background
  },
  shimmerBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  headerText: {
    marginLeft: 10,
    flex: 1
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  }
});

const AnimatedShimmerBlock = ({ width, height, borderRadius, style }: any) => {
  const styles = useStyles(themeStyles);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(animatedValue, { toValue: 0, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });
  return <Animated.View style={[styles.shimmerBlock, { width, height, borderRadius, opacity }, style]} />;
};

export const StorePostingItemShimmer = () => {
  const styles = useStyles(themeStyles);
  return (
    <View style={styles.itemContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <AnimatedShimmerBlock width={36} height={36} borderRadius={18} />
          <View style={styles.headerText}>
            <AnimatedShimmerBlock width={100} height={15} borderRadius={4} />
            <AnimatedShimmerBlock width={60} height={12} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        </View>
        {/* Follow button placeholder */}
        <AnimatedShimmerBlock width={60} height={28} borderRadius={14} style={{ marginLeft: 12 }} />
      </View>

      {/* Image (Square) */}
      <AnimatedShimmerBlock width={width} height={width} borderRadius={0} />

      {/* Info & Action Section */}
      <View style={styles.infoContainer}>
        <View style={styles.topRow}>
          {/* Title */}
          <AnimatedShimmerBlock width={width * 0.5} height={18} borderRadius={4} />
          {/* Price */}
          <AnimatedShimmerBlock width={60} height={20} borderRadius={4} />
        </View>
        
        {/* Description */}
        <AnimatedShimmerBlock width={width * 0.8} height={14} borderRadius={4} style={{ marginBottom: 4 }} />
        <AnimatedShimmerBlock width={width * 0.6} height={14} borderRadius={4} style={{ marginBottom: 16 }} />
        
        {/* Interaction Bar */}
        <View style={styles.actionBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AnimatedShimmerBlock width={40} height={20} borderRadius={4} style={{ marginRight: 16 }} />
            <AnimatedShimmerBlock width={40} height={20} borderRadius={4} style={{ marginRight: 16 }} />
            <AnimatedShimmerBlock width={40} height={20} borderRadius={4} />
          </View>
          {/* Tag / Post button placeholder */}
          <AnimatedShimmerBlock width={70} height={32} borderRadius={16} />
        </View>
      </View>
    </View>
  );
};

export const StorePostingPageShimmer = () => {
  const styles = useStyles(themeStyles);
  return (
    <View style={styles.container}>
      <StorePostingItemShimmer />
      <StorePostingItemShimmer />
    </View>
  );
};