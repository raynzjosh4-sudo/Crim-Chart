import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChartLinearLoader } from '@/components/CrimchartLoader/ChartLinearLoader';

export const ProfilePageShimmer = () => {
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
    <SafeAreaView style={styles.root}>
      {/* Linear Loader at top as requested */}
      <ChartLinearLoader isLoading={true} />

      <View style={styles.appBar}>
        <View style={styles.appBarBtn} />
        <Animated.View style={[styles.shimmerTitle, { opacity }]} />
        <View style={styles.appBarBtn} />
      </View>

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Animated.View style={[styles.shimmerName, { opacity }]} />
            <Animated.View style={[styles.shimmerSubName, { opacity }]} />
          </View>
          <Animated.View style={[styles.shimmerAvatar, { opacity }]} />
        </View>

        <View style={styles.statsRow}>
          <Animated.View style={[styles.shimmerBadge, { opacity }]} />
          <Animated.View style={[styles.shimmerBadge, { opacity }]} />
          <Animated.View style={[styles.shimmerBadge, { opacity }]} />
        </View>

        <Animated.View style={[styles.shimmerBio, { opacity }]} />
        <Animated.View style={[styles.shimmerBioLine, { opacity }]} />

        <View style={styles.actionRow}>
          <Animated.View style={[styles.shimmerActionBtn, styles.primaryBtn, { opacity }]} />
          <View style={{ width: 10 }} />
          <Animated.View style={[styles.shimmerActionBtn, styles.secondaryBtn, { opacity }]} />
        </View>
      </View>

      <View style={styles.tabBar}>
        <Animated.View style={[styles.shimmerTabItem, { opacity }]} />
        <Animated.View style={[styles.shimmerTabItem, { opacity }]} />
        <Animated.View style={[styles.shimmerTabItem, { opacity }]} />
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.shimmerContentBlock, { opacity }]} />
        <Animated.View style={[styles.shimmerContentBlock, { opacity }]} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  appBarBtn: { width: 36, height: 36 },
  shimmerTitle: {
    width: 100,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shimmerName: {
    width: 150,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  shimmerSubName: {
    width: 80,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
  },
  shimmerAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statsRow: { flexDirection: 'row', gap: 8 },
  shimmerBadge: {
    flex: 1,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  shimmerBio: {
    width: '100%',
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
  },
  shimmerBioLine: {
    width: '60%',
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
  },
  actionRow: { flexDirection: 'row' },
  shimmerActionBtn: {
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  primaryBtn: { flex: 2 },
  secondaryBtn: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  shimmerTabItem: {
    width: 40,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  shimmerContentBlock: {
    width: '100%',
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
});
