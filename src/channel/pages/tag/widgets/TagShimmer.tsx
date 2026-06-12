import React, { useRef } from 'react';
import { View, ScrollView, Animated, StyleSheet } from 'react-native';

const ShimmerBox = ({
  width,
  height,
  borderRadius = 4,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] });

  return (
    <Animated.View
      style={{ width, height, borderRadius, backgroundColor: '#333', opacity }}
    />
  );
};

const CardShimmer = () => (
  <View style={styles.card}>
    <ShimmerBox width={52} height={52} borderRadius={26} />
    <View style={{ height: 8 }} />
    <ShimmerBox width={70} height={11} borderRadius={4} />
    <View style={{ height: 4 }} />
    <ShimmerBox width={50} height={9} borderRadius={4} />
    <View style={{ height: 8 }} />
    <ShimmerBox width={60} height={26} borderRadius={13} />
  </View>
);

export const TagShimmer: React.FC = () => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.list}
    scrollEnabled={false}
  >
    <CardShimmer />
    <CardShimmer />
    <CardShimmer />
    <CardShimmer />
  </ScrollView>
);

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    gap: 10,
    alignItems: 'flex-start',
    paddingBottom: 4,
  },
  card: {
    width: 100,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
});
