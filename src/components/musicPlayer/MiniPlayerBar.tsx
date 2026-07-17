import { DownloadButton } from '@/components/buttons/DownloadButton';
import { MediaDownloadWrapper } from '@/components/wrappers/MediaDownloadWrapper';
import { useGlobalAudioPlayer } from '@/core/store/useGlobalAudioPlayer';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { Music2, Pause, Play, X } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDesktopNowPlayingStore } from '@/core/store/useDesktopNowPlayingStore';
import { usePathname, useRouter } from 'expo-router';

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
  const router = useRouter();

  const handleOpenPlayer = () => {
    if (currentMeta) {
      useDesktopNowPlayingStore.getState().openModal([{
        title: currentMeta.title,
        artist: currentMeta.artist,
        coverUrl: currentMeta.coverUrl,
        audioUrl: currentMeta.audioUrl || '',
        postId: currentMeta.id,
      }], 0);

      stopAll();
    }
  };

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
  meta: { id: string; title: string; artist: string; coverUrl: string; audioUrl?: string; downloadsCount?: number } | null;
  isPlaying: boolean;
  colors: any;
  onPauseResume: () => void;
  onStop: () => void;
}) => {
  const currentDownloads = useInteractionStore(state => {
    if (meta?.id) {
      // Find download count (could be stored under postId or boxId_postId depending on how it was seeded)
      // Since we only have meta.id (which is postId), we try to get it directly or find the first key that matches _postId
      if (state.downloadsCount[meta.id] !== undefined) {
        return state.downloadsCount[meta.id];
      }
      const boxKey = Object.keys(state.downloadsCount).find(k => k.endsWith(`_${meta.id}`));
      if (boxKey && state.downloadsCount[boxKey] !== undefined) {
        return state.downloadsCount[boxKey];
      }
    }
    return meta?.downloadsCount || 0;
  });

  return (
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

      {/* Download */}
      <MediaDownloadWrapper
        mediaUrl={meta?.audioUrl || ''}
        title={meta?.title || 'Unknown Title'}
        coverUrl={meta?.coverUrl || ''}
        mediaType="audio"
        onDownloadSuccess={() => {
          if (meta?.id) {
            useInteractionStore.getState().incrementDownload(meta.id, '', '', currentDownloads);
          }
        }}
      >
        {({ download, isDownloading }) => (
          <View style={styles.btn}>
            <DownloadButton
              onPress={download}
              isDownloading={isDownloading}
              color={colors.text}
              size={20}
              count={currentDownloads}
            />
          </View>
        )}
      </MediaDownloadWrapper>

      {/* Play / Pause */}
      <TouchableOpacity activeOpacity={0.8} onPress={onPauseResume} style={styles.btn}>
        {isPlaying ? (
          <Pause size={24} color={colors.text} />
        ) : (
          <Play size={24} color={colors.text} />
        )}
      </TouchableOpacity>

      {/* Stop / dismiss */}
      <TouchableOpacity activeOpacity={0.8} onPress={onStop} style={styles.btn}>
        <X size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

}
