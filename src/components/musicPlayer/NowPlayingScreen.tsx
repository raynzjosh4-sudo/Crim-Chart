import { useDesktopNowPlayingStore } from '@/core/store/useDesktopNowPlayingStore';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, Heart, ListMusic, Pause, Play, Shuffle, SkipBack, SkipForward } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AudioProgressBar } from './AudioProgressBar';
import { MusicQueueSheet } from './MusicQueueSheet';
import { SyncedLyrics } from './SyncedLyrics';
import { useGlobalAudioPlayer } from '@/core/store/useGlobalAudioPlayer';

interface NowPlayingScreenProps {
  title?: string;
  artist?: string;
  coverUrl?: string;
  onBack?: () => void;
  audioUrl?: string;
  lyrics?: string;
  postId?: string;
  boxId?: string;
  onNext?: () => void;
  onPrev?: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}


export interface NowPlayingScreenRef {
  togglePlayPause: () => Promise<void>;
  isPlaying: boolean;
}

export const NowPlayingScreen = ({
  title = 'Starlit Reverie',
  artist = 'Budiarti x Lil magrib',
  coverUrl = 'https://images.unsplash.com/photo-1516280440502-6c3f684a0d9b?auto=format&fit=crop&w=500&q=80',
  onBack,
  audioUrl,
  lyrics,
  postId,
  boxId,
  onNext,
  onPrev,
  onPlayStateChange,
  ref,
}: NowPlayingScreenProps & { ref?: React.Ref<NowPlayingScreenRef> }) => {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web';
  // On desktop modal, the width is capped at 450. On mobile it's full window width.
  const containerWidth = isDesktop ? Math.min(windowWidth, 450) : windowWidth;
  const artSize = containerWidth * 0.75;

  const { isShuffled, toggleShuffle } = useDesktopNowPlayingStore();



  // Read actual like state from store if postId exists
  const isLiked = useInteractionStore(state =>
    postId ? state.likes[postId] === true : false
  );

  const toggleLike = () => {
    if (postId) {
      useInteractionStore.getState().toggleLike(postId, boxId);
    }
  };

  const globalCurrentTrackId = useGlobalAudioPlayer(state => state.currentTrackId);
  const globalIsPlaying = useGlobalAudioPlayer(state => state.isPlaying);
  const globalPosition = useGlobalAudioPlayer(state => state.position);
  const globalDuration = useGlobalAudioPlayer(state => state.duration);
  const globalPlayTrack = useGlobalAudioPlayer(state => state.playTrack);
  const globalPause = useGlobalAudioPlayer(state => state.pauseCurrent);
  const globalResume = useGlobalAudioPlayer(state => state.resumeCurrent);
  const globalSeek = useGlobalAudioPlayer(state => state.seekTo);

  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);

  const isPlaying = globalIsPlaying;
  const position = globalPosition;
  const duration = globalDuration;

  useEffect(() => {
    onPlayStateChange?.(isPlaying);
  }, [isPlaying, onPlayStateChange]);

  useEffect(() => {
    if (!audioUrl) return;
    const identifier = postId || audioUrl;
    
    // If the global player is not currently playing THIS track, start it!
    // Or if it IS the track but we just clicked it from somewhere else, playTrack handles resuming.
    if (globalCurrentTrackId !== identifier) {
      globalPlayTrack(identifier, audioUrl, {
        title: title || 'Unknown',
        artist: artist || 'Unknown',
        coverUrl: coverUrl || ''
      });
    }
  }, [audioUrl, postId, title, artist, coverUrl]);

  const handleScrubStart = () => {
    setIsScrubbing(true);
  };

  const handleScrubMove = (seekMillis: number) => {
    setScrubPosition(seekMillis);
  };

  const handleScrubRelease = async (seekMillis: number) => {
    setIsScrubbing(false);
    await globalSeek(seekMillis);
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await globalPause();
    } else {
      await globalResume();
    }
  };

  React.useImperativeHandle(ref, () => ({
    togglePlayPause,
    isPlaying,
  }));

  const currentPos = isScrubbing ? scrubPosition : position;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Blurred background image layer */}
      <Image
        source={{ uri: coverUrl }}
        style={StyleSheet.absoluteFillObject}
        blurRadius={60}
      />

      {/* Dark gradient overlay to blend into the bottom */}
      <LinearGradient
        colors={['rgba(20,20,20,0.4)', 'rgba(15,15,15,0.9)', colors.background]}
        locations={[0, 0.4, 0.8]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.iconButton}>
            <ChevronDown color="#FFF" size={32} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <TouchableOpacity onPress={toggleLike} style={styles.iconButton}>
            <Heart color="#FFF" size={24} fill={isLiked ? "#FFF" : "transparent"} />
          </TouchableOpacity>
        </View>

        {isDesktop && isQueueVisible ? (
          <MusicQueueSheet
            visible={isQueueVisible}
            onClose={() => setIsQueueVisible(false)}
            isEmbedded={true}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
            {/* Circular Album Art */}
            <View style={styles.artContainer}>
              <View style={[styles.artWrapper, { width: artSize, height: artSize, borderRadius: artSize / 2 }]}>
                <Image
                  source={{ uri: coverUrl }}
                  style={[styles.artImage, { borderRadius: artSize / 2 }]}
                />
              </View>
            </View>

            {/* Song Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
              <Text style={styles.artist} numberOfLines={1} ellipsizeMode="tail">{artist}</Text>
            </View>

            {/* Lyrics Snippet */}
            <SyncedLyrics lyrics={lyrics} position={currentPos} duration={duration} />
          </ScrollView>
        )}

        {/* Progress Bar */}
        <AudioProgressBar
          position={currentPos}
          duration={duration}
          primaryColor={colors.primary}
          onScrubStart={handleScrubStart}
          onScrubMove={handleScrubMove}
          onScrubRelease={handleScrubRelease}
          audioUrl={audioUrl}
        />

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleShuffle}>
            <Shuffle color={isShuffled ? colors.primary : "#FFF"} size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, !onPrev && { opacity: 0.5 }]}
            onPress={onPrev}
            disabled={!onPrev}
          >
            <SkipBack color="#FFF" size={24} fill="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playPauseButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={togglePlayPause}
            activeOpacity={0.8}
          >
            {isPlaying ? (
              <Pause color="#000" size={32} fill="#000" />
            ) : (
              <Play color="#000" size={32} fill="#000" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, !onNext && { opacity: 0.5 }]}
            onPress={onNext}
            disabled={!onNext}
          >
            <SkipForward color="#FFF" size={24} fill="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => setIsQueueVisible(!isQueueVisible)}>
            <ListMusic color={isQueueVisible ? colors.primary : "#FFF"} size={20} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Queue Sheet (Mobile Only) */}
      {!isDesktop && (
        <MusicQueueSheet
          visible={isQueueVisible}
          onClose={() => setIsQueueVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  artContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  artWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: '#111',
  },
  artImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
    width: '100%',
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  artist: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 30,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  secondaryButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#D1ED5B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D1ED5B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});
