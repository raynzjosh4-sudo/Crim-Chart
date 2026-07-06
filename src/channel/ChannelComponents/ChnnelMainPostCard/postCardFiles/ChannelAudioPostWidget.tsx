import { Music, Pause, Play } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View, AppState } from 'react-native';
import { SyncedLyrics } from '@/components/musicPlayer/SyncedLyrics';
import { useIsFocused } from '@react-navigation/native';
import { MediaDownloadWrapper } from '@/components/wrappers/MediaDownloadWrapper';
import { DownloadButton } from '@/components/buttons/DownloadButton';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { useGlobalAudioPlayer } from '@/core/store/useGlobalAudioPlayer';

export interface ChannelAudioPostWidgetProps {
  audioUrl: string;
  thumbnailUrl?: string;
  metadata?: any;
  isActive?: boolean;
  downloadsCount?: number;
  postId?: string;
}

// Generate random pseudo-waveform heights based on the URL string
const generateHeights = (seedStr: string) => {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = seedStr.charCodeAt(i) + ((seed << 5) - seed);
  }

  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const heights: number[] = [];
  for (let i = 0; i < 50; i++) {
    let h = 0.2 + random() * 0.8;
    if (i < 5) h *= (i + 1) / 6;
    if (i > 45) h *= (50 - i) / 6;
    heights.push(Math.max(0.1, Math.min(h, 1.0)));
  }
  return heights;
};

export const ChannelAudioPostWidget: React.FC<ChannelAudioPostWidgetProps> = ({
  audioUrl,
  thumbnailUrl,
  metadata,
  isActive,
  downloadsCount = 0,
  postId,
}) => {
  const [position, setPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(30);
  const heights = useRef(generateHeights(audioUrl)).current;

  // Global audio player — one track across the entire app
  const currentTrackId = useGlobalAudioPlayer(state => state.currentTrackId);
  const globalIsPlaying = useGlobalAudioPlayer(state => state.isPlaying);
  const toggleTrack = useGlobalAudioPlayer(state => state.toggleTrack);
  const pauseCurrent = useGlobalAudioPlayer(state => state.pauseCurrent);
  
  const trackId = `audio_widget_${audioUrl}`;
  const isPlaying = currentTrackId === trackId && globalIsPlaying;

  const songTitle = metadata?.title || metadata?.songName || 'Unknown Title';
  const songArtist = metadata?.artist || metadata?.singer || 'Unknown Artist';
  
  let lyricsString = '';
  if (Array.isArray(metadata?.lyrics) && metadata.lyrics.length > 0) {
    lyricsString = metadata.lyrics.join('\n');
  } else if (typeof metadata?.lyrics === 'string' && metadata.lyrics.trim().length > 0) {
    lyricsString = metadata.lyrics;
  }

  // A beautiful default cover art if the post doesn't have one
  const fallbackThumbnail = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop';
  const displayThumbnail = thumbnailUrl || fallbackThumbnail;

  const trackMeta = {
    title: songTitle,
    artist: songArtist,
    coverUrl: displayThumbnail,
  };

  // Auto-play when scrolled into view, pause when scrolled away
  useEffect(() => {
    if (!audioUrl) return;
    if (isActive === true) {
      useGlobalAudioPlayer.getState().playTrack(trackId, audioUrl, trackMeta);
    } else if (isActive === false) {
      if (useGlobalAudioPlayer.getState().currentTrackId === trackId) {
        pauseCurrent();
      }
    }
  }, [isActive, audioUrl, trackId]);

  // Pause when app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState !== 'active') {
        if (useGlobalAudioPlayer.getState().currentTrackId === trackId) {
          pauseCurrent();
        }
      }
    });
    return () => subscription.remove();
  }, [trackId]);

  // Pause when screen loses focus (navigating away)
  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isFocused) {
      if (useGlobalAudioPlayer.getState().currentTrackId === trackId) {
        pauseCurrent();
      }
    }
  }, [isFocused, trackId]);


  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const progress = totalDuration > 0 ? Math.min(position / totalDuration, 1.0) : 0;

  // Spinning animation for the disk
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    if (isPlaying) {
      animation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
    } else {
      spinValue.stopAnimation();
      // Optionally reset rotation on stop: spinValue.setValue(0);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [isPlaying, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => toggleTrack(trackId, audioUrl, trackMeta)} style={styles.container}>
      {/* Blurred Background */}
      <Image 
        source={{ uri: displayThumbnail }} 
        style={[StyleSheet.absoluteFillObject, { opacity: 0.5 }]} 
        blurRadius={50} 
      />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />

      {/* Download Button */}
      <View style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <MediaDownloadWrapper
          mediaUrl={audioUrl}
          title={songTitle}
          coverUrl={displayThumbnail}
          mediaType="audio"
          onDownloadSuccess={() => {
            if (postId) {
               useInteractionStore.getState().incrementDownload(postId);
            }
          }}
        >
          {({ download, isDownloading }) => (
            <DownloadButton
              onPress={download}
              isDownloading={isDownloading}
              color="rgba(255,255,255,0.8)"
              size={24}
              count={downloadsCount}
            />
          )}
        </MediaDownloadWrapper>
      </View>

      {/* Large Circular Disk with Play Overlay */}
      <View style={styles.largeDiskContainer}>
        <Animated.View style={[styles.largeDisk, { transform: [{ rotate: spin }] }]}>
          <Image source={{ uri: displayThumbnail }} style={styles.diskImage} />
        </Animated.View>
        
        <View style={[StyleSheet.absoluteFillObject, styles.diskOverlayContent]}>
          <View style={styles.centerPlayBtnInner}>
            {isPlaying ? (
              <Pause fill="#FFF" color="#FFF" size={32} />
            ) : (
              <Play fill="#FFF" color="#FFF" size={32} style={{ marginLeft: 4 }} />
            )}
          </View>
        </View>
      </View>

      {/* Waveform & Timer */}
      <View style={styles.waveformWrapper}>
        <View style={styles.waveformContainer}>
          {heights.map((h, i) => {
            const isPlayed = (i / heights.length) <= progress;
            return (
              <View
                key={i}
                style={[
                  styles.bar,
                  {
                    height: `${h * 100}%`,
                    backgroundColor: isPlayed ? '#FFF' : 'rgba(255,255,255,0.3)',
                  },
                ]}
              />
            );
          })}
        </View>
        <Text style={styles.timeText}>
          {isPlaying || position > 0 ? formatDuration(position) : formatDuration(totalDuration)}
        </Text>
      </View>

      {/* Title & Artist */}
      <Text style={styles.largeTitleText} numberOfLines={1}>{songTitle}</Text>
      <Text style={styles.largeArtistText} numberOfLines={1}>{songArtist}</Text>

      {/* Lyrics using custom SyncedLyrics widget */}
      {lyricsString ? (
        <SyncedLyrics 
          lyrics={lyricsString} 
          position={position} 
          duration={totalDuration} 
        />
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  largeDiskContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 16,
  },
  largeDisk: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diskImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  diskOverlayContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerPlayBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformWrapper: {
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  waveformContainer: {
    width: '100%',
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
  largeTitleText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  largeArtistText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 0,
    textAlign: 'center',
  },
});
