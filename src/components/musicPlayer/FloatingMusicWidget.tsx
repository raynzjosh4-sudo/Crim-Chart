import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions, Image } from 'react-native';
import { useDesktopNowPlayingStore } from '@/core/store/useDesktopNowPlayingStore';
import { useGlobalAudioPlayer } from '@/core/store/useGlobalAudioPlayer';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { Pause, Play, SkipBack, SkipForward, Music2, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DownloadButton } from '@/components/buttons/DownloadButton';
import { MediaDownloadWrapper } from '@/components/wrappers/MediaDownloadWrapper';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { AudioProgressBar } from '@/components/musicPlayer/AudioProgressBar';

export const FloatingMusicWidget = () => {
  const theme = useCurrentTheme();
  const colors = theme.colors;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const insets = useSafeAreaInsets();
  
  const { isOpen, queue, currentIndex, nextTrack, prevTrack } = useDesktopNowPlayingStore();
  const { isPlaying, position, duration, seekTo, pauseCurrent, resumeCurrent } = useGlobalAudioPlayer();
  
  const [isDismissed, setIsDismissed] = useState(false);
  
  const currentTrack = queue[currentIndex];
  
  // Un-dismiss automatically when the track changes
  const lastTrackRef = useRef(currentTrack?.audioUrl);
  useEffect(() => {
    if (currentTrack?.audioUrl && currentTrack.audioUrl !== lastTrackRef.current) {
      setIsDismissed(false);
      lastTrackRef.current = currentTrack.audioUrl;
    }
  }, [currentTrack]);
  
  // Also un-dismiss if the user explicitly triggers openModal again
  const lastIsOpen = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !lastIsOpen.current) {
      setIsDismissed(false);
    }
    lastIsOpen.current = isOpen;
  }, [isOpen]);

  const visible = isOpen && queue.length > 0 && !isDismissed;

  const currentDownloads = useInteractionStore(state => {
    if (currentTrack?.postId) {
      if (state.downloadsCount[currentTrack.postId] !== undefined) {
        return state.downloadsCount[currentTrack.postId];
      }
      const boxKey = Object.keys(state.downloadsCount).find(k => k.endsWith(`_${currentTrack.postId}`));
      if (boxKey && state.downloadsCount[boxKey] !== undefined) {
        return state.downloadsCount[boxKey];
      }
    }
    return currentTrack?.downloadsCount || 0;
  });
  
  if (!visible || !currentTrack) return null;

  const hasNext = currentIndex < queue.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <View style={[styles.container, isDesktop ? styles.desktopPos : { bottom: Math.max(insets.bottom, 80) + 16, left: 16, right: 16 }, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity 
        style={styles.closeBtn} 
        onPress={() => setIsDismissed(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <X size={18} color={colors.textSecondary} />
      </TouchableOpacity>
      
      <View style={styles.topRow}>
        {currentTrack.coverUrl ? (
          <Image source={{ uri: currentTrack.coverUrl }} style={styles.coverArt} />
        ) : (
          <View style={[styles.coverArtFallback, { backgroundColor: colors.primary + '22' }]}>
            <Music2 size={24} color={colors.primary} />
          </View>
        )}
        
        <View style={styles.infoCol}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{currentTrack.title || 'Unknown Title'}</Text>
          <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>{currentTrack.artist || 'Unknown Artist'}</Text>
        </View>
        
        <View style={styles.controlsRow}>
          <MediaDownloadWrapper
            mediaUrl={currentTrack.audioUrl || ''}
            title={currentTrack.title}
            coverUrl={currentTrack.coverUrl || ''}
            mediaType="audio"
            onDownloadSuccess={() => {
              if (currentTrack.postId) {
                const incrementDownload = useInteractionStore.getState().incrementDownload;
                incrementDownload(currentTrack.postId, currentTrack.boxId, '', currentDownloads);
              }
            }}
          >
            {({ download, isDownloading }) => (
              <View style={styles.controlBtnWrapper}>
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
          
          <TouchableOpacity style={styles.controlBtnWrapper} onPress={hasPrev ? prevTrack : undefined} disabled={!hasPrev} activeOpacity={0.7}>
            <SkipBack size={22} color={hasPrev ? colors.text : colors.textSecondary + '66'} fill={hasPrev ? colors.text : colors.textSecondary + '66'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlBtnWrapper, { marginHorizontal: 2 }]} 
            activeOpacity={0.7}
            onPress={() => {
              if (isPlaying) pauseCurrent();
              else resumeCurrent();
            }}
          >
            {isPlaying ? (
              <Pause size={28} color={colors.text} fill={colors.text} />
            ) : (
              <Play size={28} color={colors.text} fill={colors.text} style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlBtnWrapper} onPress={hasNext ? nextTrack : undefined} disabled={!hasNext} activeOpacity={0.7}>
            <SkipForward size={22} color={hasNext ? colors.text : colors.textSecondary + '66'} fill={hasNext ? colors.text : colors.textSecondary + '66'} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.waveRow}>
        <AudioProgressBar 
          position={position}
          duration={duration}
          primaryColor={colors.primary}
          onScrubStart={() => {}}
          onScrubMove={(ms) => {}}
          onScrubRelease={(ms) => {
             seekTo(ms);
          }}
          audioUrl={currentTrack.audioUrl}
          compact={true}
          style={styles.waveBar}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 20,
    padding: 16,
    paddingTop: 16,
    borderWidth: 1,
    zIndex: 99999,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  desktopPos: {
    bottom: 24,
    right: 24,
    width: 380,
  },
  closeBtn: {
    position: 'absolute',
    top: 6,
    right: 8,
    zIndex: 10,
    padding: 4,
    ...(Platform.OS === 'web' && { cursor: 'pointer' as any })
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingRight: 10, // give space for 'X'
  },
  coverArt: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
  },
  coverArtFallback: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlBtnWrapper: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' as any })
  },
  waveRow: {
    marginTop: 4,
    width: '100%',
  },
  waveBar: {
    marginTop: 0,
    paddingHorizontal: 0,
  }
});
