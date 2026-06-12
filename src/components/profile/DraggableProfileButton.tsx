import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Animated, Image, PanResponder, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DraggableProfileButton = ({
  initialX = 20,
  initialY = 80,
  widgetSize = 50,
}) => {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;

  const minX = 10;
  const maxX = screenWidth - widgetSize - 10;
  const minY = insets.top + 10;
  const maxY = screenHeight - widgetSize - insets.bottom - 16;

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gestureState) => {
        pan.flattenOffset();
        const distance = Math.sqrt(gestureState.dx ** 2 + gestureState.dy ** 2);
        
        if (distance < 6) {
          router.push('/profile');
        }

        const centerX = (pan.x as any)._value + widgetSize / 2;
        const targetX = centerX > screenWidth / 2 ? maxX : minX;
        const targetY = clamp((pan.y as any)._value, minY, maxY);

        Animated.spring(pan, {
          toValue: { x: targetX, y: targetY },
          useNativeDriver: false,
          friction: 6,
          tension: 40,
        }).start();
      },
    })
  ).current;

  const displayImageUrl = user?.profileImageUrl;
  const hasImage = !!displayImageUrl;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: widgetSize,
          height: widgetSize,
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
          shadowColor: colors.primary,
          elevation: hasImage ? 0 : 8,
          backgroundColor: hasImage ? 'transparent' : colors.primary,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {hasImage ? (
        <Image
          source={{ uri: displayImageUrl }}
          style={[styles.image, { width: widgetSize, height: widgetSize }]}
          resizeMode="cover"
        />
      ) : (
        <User color="#fff" size={widgetSize * 0.54} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 9999,
  },
  image: {
    borderRadius: 100,
  },
});
