import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useGlobalAudioPlayer } from '@/core/store/useGlobalAudioPlayer';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { Pause, Play, X, Music2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePathname } from 'expo-router';

/**
 * MiniPlayerBar
 *
 * An absolutely-positioned now-playing bar that sits above the bottom nav
 * on mobile and as a floating card on desktop. Always visible while a track
 * is playing regardless of which page you are on.
 */
export const MiniPlayerBar = () => {
  const theme = useCurrentTheme();
  const colors = theme.colors;
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const hideMobileBottomNav = pathname.startsWith('/profile') || 
                              pathname.startsWith('/notifications') || 
                              pathname.startsWith('/my-music') || 
                              pathname.startsWith('/statuses');

  // Bottom nav height: 60px bar + safe area. If hidden, just use safe area + a little gap
  const TAB_BAR_HEIGHT = hideMobileBottomNav ? insets.bottom + 8 : 60 + insets.bottom;

  const currentTrackId = useGlobalAudioPlayer((s) => s.currentTrackId);
  const isPlaying = useGlobalAudioPlayer((s) => s.isPlaying);
  const pauseCurrent = useGlobalAudioPlayer((s) => s.pauseCurrent);
  const resumeCurrent = useGlobalAudioPlayer((s) => s.resumeCurrent);
  const stopAll = useGlobalAudioPlayer((s) => s.stopAll);
  const currentMeta = useGlobalAudioPlayer((s) => s.currentTrackMeta);

  const slideAnim = useRef(new Animated.Value(100)).current;
  const visible = !!currentTrackId;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 100,
      useNativeDriver: true,
      tension: 80,
      friction: 14,
    }).start();
  }, [visible]);

  if (!visible && !currentMeta) return null;

  // Desktop: floating card bottom-left (above nothing, sidebar is on left)
  if (isDesktop) {
    return (
      <Animated.View
        style={[
          styles.desktopContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.surfaceVariant,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <BarContent
          meta={currentMeta}
          isPlaying={isPlaying}
          colors={colors}
          onPauseResume={() => (isPlaying ? pauseCurrent() : resumeCurrent())}
          onStop={stopAll}
        />
      </Animated.View>
    );
  }

  // Mobile: sits right above the bottom tab bar
  return (
    <Animated.View
      style={[
        styles.mobileContainer,
        {
          bottom: TAB_BAR_HEIGHT,
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceVariant,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <BarContent
        meta={currentMeta}
        isPlaying={isPlaying}
        colors={colors}
        onPauseResume={() => (isPlaying ? pauseCurrent() : resumeCurrent())}
        onStop={stopAll}
      />
    </Animated.View>
  );
};

/** Shared inner content for both layouts */
const BarContent = ({
  meta,
  isPlaying,
  colors,
  onPauseResume,
  onStop,
}: {
  meta: { title: string; artist: string; coverUrl: string } | null;
  isPlaying: boolean;
  colors: any;
  onPauseResume: () => void;
  onStop: () => void;
}) => (
  <View style={styles.row}>
    {/* Album art */}
    {meta?.coverUrl ? (
      <Image source={{ uri: meta.coverUrl }} style={styles.art} />
    ) : (
      <View style={[styles.artFallback, { backgroundColor: colors.primary + '22' }]}>
        <Music2 size={18} color={colors.primary} />
      </View>
    )}

    {/* Track info */}
    <View style={styles.info}>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {meta?.title ?? 'Now Playing'}
      </Text>
      <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>
        {meta?.artist ?? ''}
      </Text>
    </View>

    {/* Play / Pause */}
    <TouchableOpacity activeOpacity={0.7} onPress={onPauseResume} style={styles.btn}>
      {isPlaying ? (
        <Pause size={24} color={colors.text} />
      ) : (
        <Play size={24} color={colors.text} />
      )}
    </TouchableOpacity>

    {/* Stop / dismiss */}
    <TouchableOpacity activeOpacity={0.7} onPress={onStop} style={styles.btn}>
      <X size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  /** Mobile: absolute, full-width, above bottom tab bar */
  mobileContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 0.5,
    zIndex: 999,
  },
  /** Desktop: floating card, bottom-left */
  desktopContainer: {
    position: 'absolute',
    bottom: 24,
    left: 104,
    width: 320,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  art: {
    width: 42,
    height: 42,
    borderRadius: 8,
    marginRight: 10,
  },
  artFallback: {
    width: 42,
    height: 42,
    borderRadius: 8,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginRight: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  artist: {
    fontSize: 12,
    marginTop: 2,
  },
  btn: {
    padding: 8,
  },
});
