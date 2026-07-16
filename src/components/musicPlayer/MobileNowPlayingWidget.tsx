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
import { useDesktopNowPlayingStore } from '@/core/store/useDesktopNowPlayingStore';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { Pause, Play, Music2, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { DownloadButton } from '@/components/buttons/DownloadButton';
import { MediaDownloadWrapper } from '@/components/wrappers/MediaDownloadWrapper';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { Audio } from 'expo-av';
import { useState } from 'react';

const MINI_PLAYER_HEIGHT = 64;

export const MobileNowPlayingWidget = () => {
  const theme = useCurrentTheme();
  const colors = theme.colors;
  const { height: windowHeight, width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const {
    isOpen,
    queue,
    currentIndex,
    closeModal,
  } = useDesktopNowPlayingStore();

  const [isPlaying, setIsPlaying] = useState(true);

  const hideMobileBottomNav =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/my-music') ||
    pathname.startsWith('/statuses');

  const TAB_BAR_HEIGHT = hideMobileBottomNav ? insets.bottom + 8 : 60 + insets.bottom;

  // We only render on mobile when the queue has items and the player is considered "open"
  const visible = !isDesktop && isOpen && queue.length > 0;

  const translateY = useRef(new Animated.Value(windowHeight)).current;

  useEffect(() => {
    if (!visible) {
      Animated.timing(translateY, {
        toValue: windowHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return;
    }

    const minimizedY = windowHeight - TAB_BAR_HEIGHT - MINI_PLAYER_HEIGHT;

    Animated.spring(translateY, {
      toValue: minimizedY,
      useNativeDriver: true,
      tension: 65,
      friction: 12,
    }).start();
  }, [visible, windowHeight, TAB_BAR_HEIGHT]);

  if (!visible) return null;

  const currentTrack = queue[currentIndex];
  if (!currentTrack) return null;

  const minimizedY = windowHeight - TAB_BAR_HEIGHT - MINI_PLAYER_HEIGHT;

  const miniPlayerOpacity = translateY.interpolate({
    inputRange: [minimizedY, windowHeight],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]} pointerEvents="box-none">
      {/* Minimized Player */}
      <Animated.View style={[styles.miniPlayer, { opacity: 1, backgroundColor: colors.surface, borderTopColor: colors.surfaceVariant }]} pointerEvents="auto">
        <View style={styles.miniPlayerRow}>
          {currentTrack.coverUrl ? (
            <Image source={{ uri: currentTrack.coverUrl }} style={styles.miniArt} />
          ) : (
            <View style={[styles.miniArtFallback, { backgroundColor: colors.primary + '22' }]}>
              <Music2 size={18} color={colors.primary} />
            </View>
          )}

          <View style={styles.miniInfo}>
            <Text style={[styles.miniTitle, { color: colors.text }]} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={[styles.miniArtist, { color: colors.textSecondary }]} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
          
          <MediaDownloadWrapper
            mediaUrl={currentTrack.audioUrl || ''}
            title={currentTrack.title}
            coverUrl={currentTrack.coverUrl || ''}
            mediaType="audio"
            onDownloadSuccess={() => {
              if (currentTrack.postId) {
                const incrementDownload = useInteractionStore.getState().incrementDownload;
                incrementDownload(currentTrack.postId, currentTrack.boxId);
              }
            }}
          >
            {({ download, isDownloading }) => (
              <View style={styles.controlBtn}>
                <DownloadButton
                  onPress={download}
                  isDownloading={isDownloading}
                  color={colors.text}
                  size={20}
                  count={0}
                />
              </View>
            )}
          </MediaDownloadWrapper>

          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.controlBtn} 
            onPress={() => {
              // Toggle global audio play/pause
              const globalPlayer = require('@/core/store/useGlobalAudioPlayer').useGlobalAudioPlayer.getState();
              if (globalPlayer.isPlaying) {
                globalPlayer.pause();
                setIsPlaying(false);
              } else {
                globalPlayer.resume();
                setIsPlaying(true);
              }
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isPlaying ? (
              <Pause color={colors.text} size={24} fill={colors.text} />
            ) : (
              <Play color={colors.text} size={24} fill={colors.text} style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.controlBtn, { marginLeft: 8 }]} 
            onPress={() => closeModal()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X color={colors.textSecondary} size={24} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  miniPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: MINI_PLAYER_HEIGHT,
    borderTopWidth: 0.5,
  },
  miniPlayerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  miniArt: {
    width: 42,
    height: 42,
    borderRadius: 8,
    marginRight: 10,
  },
  miniArtFallback: {
    width: 42,
    height: 42,
    borderRadius: 8,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniInfo: {
    flex: 1,
    marginRight: 4,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  miniArtist: {
    fontSize: 12,
    marginTop: 2,
  },
  controlBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
