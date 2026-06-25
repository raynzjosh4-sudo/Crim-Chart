import React, { useRef } from 'react';
import { View, ScrollView, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

const ShimmerBox = ({
  width,
  height,
  borderRadius = 4,
  dark,
  colors,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  dark: boolean;
  colors: any;
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
      style={{ width, height, borderRadius, backgroundColor: dark ? '#333' : colors.border, opacity }}
    />
  );
};

const CardShimmer = ({ dark, colors }: any) => (
  <View style={styles.card}>
    <ShimmerBox width={72} height={72} borderRadius={36} dark={dark} colors={colors} />
    <View style={{ height: 8 }} />
    <ShimmerBox width={60} height={12} borderRadius={4} dark={dark} colors={colors} />
    <View style={{ height: 8 }} />
    <ShimmerBox width={46} height={22} borderRadius={11} dark={dark} colors={colors} />
  </View>
);

export const TagShimmer: React.FC = () => {
  const { colors, dark } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      scrollEnabled={false}
    >
      <CardShimmer dark={dark} colors={colors} />
      <CardShimmer dark={dark} colors={colors} />
      <CardShimmer dark={dark} colors={colors} />
      <CardShimmer dark={dark} colors={colors} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    paddingBottom: 4,
  },
  card: {
    width: 72,
    alignItems: 'center',
    marginRight: 18,
  },
});
