import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Platform, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, Shuffle, SkipBack, Pause, Play, SkipForward, ListMusic } from 'lucide-react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useTheme } from '@react-navigation/native';
import { SyncedLyrics } from './SyncedLyrics';
import { AudioProgressBar } from './AudioProgressBar';

const { width } = Dimensions.get('window');

interface NowPlayingScreenProps {
  title?: string;
  artist?: string;
  coverUrl?: string;
  onBack?: () => void;
  audioUrl?: string;
  lyrics?: string;
}

export const NowPlayingScreen: React.FC<NowPlayingScreenProps> = ({
  title = 'Starlit Reverie',
  artist = 'Budiarti x Lil magrib',
  coverUrl = 'https://images.unsplash.com/photo-1516280440502-6c3f684a0d9b?auto=format&fit=crop&w=500&q=80',
  onBack,
  audioUrl,
  lyrics,
}) => {
  const { colors } = useTheme();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);

  const handleScrubStart = () => {
    setIsScrubbing(true);
  };

  const handleScrubMove = (seekMillis: number) => {
    setScrubPosition(seekMillis);
  };

  const handleScrubRelease = async (seekMillis: number) => {
    if (!sound) {
      setIsScrubbing(false);
      return;
    }
    setPosition(seekMillis);
    setIsScrubbing(false);
    await sound.setPositionAsync(seekMillis);
  };

  useEffect(() => {
    let currentSound: Audio.Sound | null = null;

    const loadAudio = async () => {
      if (!audioUrl) return;

      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );

        currentSound = newSound;
        setSound(newSound);
        setIsPlaying(true);
      } catch (err) {
        console.error('Error loading audio:', err);
      }
    };

    loadAudio();

    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, [audioUrl]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const currentPos = isScrubbing ? scrubPosition : position;
  const progressPercent = duration > 0 ? (currentPos / duration) * 100 : 0;
  const timeRemaining = duration - currentPos;

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
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Now Playing</Text>
          
          <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.iconButton}>
            <Heart color="#FFF" size={24} fill={isLiked ? "#FFF" : "transparent"} />
          </TouchableOpacity>
        </View>

        {/* Circular Album Art */}
        <View style={styles.artContainer}>
          <View style={styles.artWrapper}>
            <Image 
              source={{ uri: coverUrl }}
              style={styles.artImage}
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

        {/* Progress Bar */}
        <AudioProgressBar
          position={currentPos}
          duration={duration}
          primaryColor={colors.primary}
          onScrubStart={handleScrubStart}
          onScrubMove={handleScrubMove}
          onScrubRelease={handleScrubRelease}
        />

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity>
            <Shuffle color="rgba(255,255,255,0.7)" size={22} />
          </TouchableOpacity>

          <View style={styles.mainControls}>
            <TouchableOpacity style={styles.secondaryButton}>
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

            <TouchableOpacity style={styles.secondaryButton}>
              <SkipForward color="#FFF" size={24} fill="#FFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity>
            <ListMusic color="rgba(255,255,255,0.7)" size={22} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
    marginTop: 30,
  },
  artWrapper: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
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
    borderRadius: (width * 0.75) / 2,
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
