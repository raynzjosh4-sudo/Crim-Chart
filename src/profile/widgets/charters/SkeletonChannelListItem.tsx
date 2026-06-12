import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export const SkeletonChannelListItem: React.FC = () => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [animValue]);

  const backgroundColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.12)'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.avatarStackArea}>
        <Animated.View style={[styles.avatar, { backgroundColor, left: 26, zIndex: 1 }]} />
        <Animated.View style={[styles.avatar, { backgroundColor, left: 13, zIndex: 2 }]} />
        <Animated.View style={[styles.avatar, { backgroundColor, left: 0, zIndex: 3 }]} />
      </View>
      <View style={styles.textArea}>
        <View style={styles.row}>
          <Animated.View style={[styles.textLine, { flex: 1, height: 16, backgroundColor }]} />
          <Animated.View style={[styles.textLine, { width: 40, height: 11, marginLeft: 16, backgroundColor }]} />
        </View>
        <View style={[styles.row, { marginTop: 8 }]}>
          <Animated.View style={[styles.textLine, { flex: 1, height: 14, backgroundColor }]} />
          <Animated.View style={[styles.textLine, { width: 30, height: 13, marginLeft: 16, backgroundColor }]} />
          <Animated.View style={[styles.textLine, { width: 30, height: 13, marginLeft: 12, backgroundColor }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
  },
  avatarStackArea: {
    width: 75,
    height: 48,
  },
  avatar: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#000', // Scaffold background color
  },
  textArea: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textLine: {
    borderRadius: 4,
  },
});
