import { useCurrentTheme } from '@/core/store/useThemeStore';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const MusicItemShimmer = () => {
  const theme = useCurrentTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });
  const bg = theme.colors.text + '18';
  const bgStrong = theme.colors.text + '28';

  return (
    <Animated.View style={[styles.item, { opacity, borderBottomColor: theme.colors.text + '12' }]}>
      {/* Disc placeholder */}
      <View style={[styles.disc, { backgroundColor: bgStrong }]} />

      <View style={styles.info}>
        <View style={[styles.titleBar, { backgroundColor: bgStrong, width: '65%' }]} />
        <View style={[styles.subtitleBar, { backgroundColor: bg, width: '40%' }]} />
        <View style={styles.btnRow}>
          <View style={[styles.btn, { backgroundColor: bg }]} />
          <View style={[styles.btnPrimary, { backgroundColor: bgStrong }]} />
        </View>
      </View>
    </Animated.View>
  );
};

export const MusicListShimmer = ({ count = 5 }: { count?: number }) => (
  <View style={styles.container}>
    {Array.from({ length: count }).map((_, i) => (
      <MusicItemShimmer key={i} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '4%',
    paddingVertical: '3%',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  disc: {
    aspectRatio: 1,
    width: '18%',
    borderRadius: 999,
    marginRight: '3%',
  },
  info: {
    flex: 1,
    gap: 8,
  },
  titleBar: {
    height: 13,
    borderRadius: 6,
  },
  subtitleBar: {
    height: 10,
    borderRadius: 5,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  btn: {
    height: 26,
    flex: 1,
    borderRadius: 13,
  },
  btnPrimary: {
    height: 26,
    flex: 0.8,
    borderRadius: 13,
  },
});
