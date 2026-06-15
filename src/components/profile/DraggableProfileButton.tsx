import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { colors } from '@/core/theme/colors';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Animated, Image, PanResponder, StyleSheet, useWindowDimensions, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLiveStatusViews } from '@/hooks/useLiveStatusViews';
import { StatusViewsMenuDialog } from '@/components/statusviews/StatusViewsMenuDialog';
import { supabase } from '@/core/supabase/supabaseConfig';

export const DraggableProfileButton = ({
  initialX = 20,
  initialY = 80,
  widgetSize = 64,
}) => {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;

  const minX = 10;
  const maxX = screenWidth - widgetSize - 10;
  const minY = insets.top + 10;
  const maxY = screenHeight - widgetSize - insets.bottom - 16;

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const { viewsCount } = useLiveStatusViews(user?.id);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(null);

  const viewsCountRef = useRef(viewsCount);
  viewsCountRef.current = viewsCount;

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
          if (viewsCountRef.current > 0) {
            setMenuAnchor({
              x: (pan.x as any)._value,
              y: (pan.y as any)._value,
            });
            setMenuVisible(true);
          } else {
            router.push('/profile');
          }
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
    <>
      <Animated.View
        style={[
          styles.container,
          {
            width: widgetSize,
            height: widgetSize,
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
            shadowColor: '#000',
            elevation: 8,
            backgroundColor: colors.primary,
            borderWidth: 4,
            borderTopColor: 'rgba(255, 255, 255, 0.6)',
            borderLeftColor: 'rgba(255, 255, 255, 0.6)',
            borderBottomColor: 'rgba(0, 0, 0, 0.4)',
            borderRightColor: 'rgba(0, 0, 0, 0.4)',
          },
        ]}
        {...panResponder.panHandlers}
      >
        {hasImage ? (
          <Image
            source={{ uri: displayImageUrl }}
            style={[styles.image, { width: widgetSize - 8, height: widgetSize - 8 }]}
            resizeMode="cover"
          />
        ) : (
          <User color="#fff" size={(widgetSize - 8) * 0.54} />
        )}

        {viewsCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{viewsCount}</Text>
          </View>
        )}
      </Animated.View>

      <StatusViewsMenuDialog
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        anchor={menuAnchor}
        widgetSize={widgetSize}
        onViewersPress={() => {
          setMenuVisible(false);
          router.push('/status-viewers');
        }}
        onProfilePress={() => {
          setMenuVisible(false);
          router.push('/profile');
        }}
      />
    </>
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
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#FF3B30', 
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
