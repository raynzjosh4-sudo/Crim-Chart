import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export const GlassShimmer = ({ skeletonUser }: { skeletonUser?: { name: string; avatar: string } }) => {
  const opacity = useSharedValue(0.3);
  
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 800 }), withTiming(0.3, { duration: 800 })),
      -1, true
    );
  }, []);
  
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#181818' }, animStyle]} />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, backgroundColor: 'rgba(0,0,0,0.3)' }} />
      <View style={{ paddingTop: Platform.OS === 'android' ? 50 : 60, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' }}>
        <Animated.View style={[{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#333' }, animStyle]} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>{skeletonUser?.name || 'Loading...'}</Text>
          <Animated.View style={[{ width: 80, height: 10, backgroundColor: '#333', borderRadius: 5, marginTop: 4 }, animStyle]} />
        </View>
      </View>
    </View>
  );
};
