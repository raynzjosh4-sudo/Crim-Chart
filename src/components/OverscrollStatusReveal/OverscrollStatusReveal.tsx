import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import AppAvatar from '@/components/avatar/AppAvatar';

interface OverscrollStatusRevealProps {
  overscroll: number;
  user: {
    displayName: string;
    profileImageUrl?: string;
  };
}

export const OverscrollStatusReveal: React.FC<OverscrollStatusRevealProps> = ({ overscroll, user }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: overscroll,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [overscroll]);

  const MAX_OVERSCROLL = 140;

  const height = animatedValue.interpolate({
    inputRange: [0, MAX_OVERSCROLL],
    outputRange: [0, 160],
    extrapolate: 'clamp',
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, MAX_OVERSCROLL * 0.4, MAX_OVERSCROLL],
    outputRange: [0, 0.2, 1],
    extrapolate: 'clamp',
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, MAX_OVERSCROLL],
    outputRange: [0.6, 1],
    extrapolate: 'clamp',
  });

  const handlePress = () => {
    alert(`Opening ${user.displayName}'s Statuses...`);
  };

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.title}>Release to view status</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
          <View style={styles.avatarWrapper}>
            <AppAvatar
              url={user.profileImageUrl}
              size={64}
              showStatusRing={true}
              showActiveDot={false}
            />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user.displayName}</Text>
        <Text style={styles.subtitle}>2 recent updates</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  title: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginBottom: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  avatarWrapper: {
    marginVertical: 4,
    shadowColor: '#FACD11',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  name: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
});
