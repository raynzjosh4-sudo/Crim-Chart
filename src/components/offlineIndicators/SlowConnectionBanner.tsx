import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { useNetworkState, NetworkState } from './useNetworkState';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles } from '@/core/hooks/useStyles';

interface SlowConnectionBannerProps {
  overrideState?: NetworkState;
}

export const SlowConnectionBanner: React.FC<SlowConnectionBannerProps> = ({ overrideState }) => {
  const networkState = useNetworkState(overrideState);
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const styles = useStyles(themeStyles);
  
  const translateY = useSharedValue(-150);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (networkState === 'slow') {
      setVisible(true);
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });

      timer = setTimeout(() => {
        translateY.value = withTiming(-150, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(setVisible)(false);
          }
        });
      }, 3000); // 3 seconds auto-dismiss
    } else {
      translateY.value = withTiming(-150, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(setVisible)(false);
        }
      });
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [networkState, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const topInset = Math.max(insets.top, Platform.OS === 'web' ? 16 : 40);

  return (
    <Animated.View style={[styles.container, { top: topInset }, animatedStyle]} pointerEvents="none">
      <Text style={styles.text}>
        {t('offline.slow_connection_banner', 'Slow connection ⛅ . Content may take longer to load ⏳')}
      </Text>
    </Animated.View>
  );
};

const themeStyles = (colors: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.surfaceVariant || '#333333',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    color: colors.text || '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
