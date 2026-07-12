import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { useNetworkState, NetworkState } from './useNetworkState';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';

interface OfflineStaleDataBannerProps {
  overrideState?: NetworkState;
}

export const OfflineStaleDataBanner: React.FC<OfflineStaleDataBannerProps> = ({ overrideState }) => {
  const networkState = useNetworkState(overrideState);
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  
  const translateY = useSharedValue(-150);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (networkState === 'offline') {
      setVisible(true);
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });

      timer = setTimeout(() => {
        translateY.value = withTiming(-150, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(setVisible)(false);
          }
        });
      }, 20000); // 20 seconds auto-dismiss
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
      <WifiOff color={theme.colors.text} size={20} />
      <Text style={styles.text}>
        {t('offline.stale_data', 'You are offline. Showing cached data.')}
      </Text>
    </Animated.View>
  );
};

const themeStyles = (colors: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border || colors.surfaceVariant,
  },
  text: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
