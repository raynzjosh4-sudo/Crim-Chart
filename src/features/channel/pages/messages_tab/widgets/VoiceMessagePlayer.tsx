import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
// import { Audio } from 'expo-av';
import { Play, Pause } from 'lucide-react-native';

interface VoiceMessagePlayerProps {
  url: string;
  duration?: number; // duration in ms
  isMe: boolean;
}

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
};

const pseudoRandom = (seed: number) => {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({ url, duration, isMe }) => {
  const [sound, setSound] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);

  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);

  useEffect(() => {
    const seed = hashString(url);
    const heights: number[] = [];
    let currentSeed = seed;
    for (let i = 0; i < 40; i++) {
      let height = 0.2 + pseudoRandom(currentSeed++) * 0.8;
      if (i < 3) height *= (i + 1) / 4;
      if (i > 36) height *= (40 - i) / 4;
      heights.push(Math.max(0.1, Math.min(1.0, height)));
    }
    setWaveformHeights(heights);

    let isMounted = true;
    const initSound = async () => {
      try {
        // const { sound: newSound, status } = await Audio.Sound.createAsync(
        //   { uri: url },
        //   { shouldPlay: false }
        // );
        // if (!isMounted) {
        //   newSound.unloadAsync();
        //   return;
        // }
        // setSound(newSound);
        // if (status.isLoaded && status.durationMillis) {
        //   setTotalDuration(status.durationMillis);
        // }
        
        // newSound.setOnPlaybackStatusUpdate((status) => {
        //   if (!status.isLoaded) return;
        //   if (isMounted) {
        //     setIsPlaying(status.isPlaying);
        //     setPosition(status.positionMillis);
        //     if (status.didJustFinish) {
        //       newSound.setPositionAsync(0);
        //     }
        //   }
        // });
      } catch (err) {
        console.log('Error loading audio:', err);
      }
    };
    initSound();

    return () => {
      isMounted = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [url]);

  const togglePlay = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handleSeek = async (percentage: number) => {
    if (!sound || totalDuration === 0) return;
    const seekPos = Math.floor(totalDuration * Math.max(0, Math.min(1, percentage)));
    await sound.setPositionAsync(seekPos);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: any) => {
        const { locationX } = evt.nativeEvent;
        handleSeek(locationX / 160);
      },
      onPanResponderMove: (evt: any) => {
        const { locationX } = evt.nativeEvent;
        handleSeek(locationX / 160);
      },
    })
  ).current;

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? Math.min(1, position / totalDuration) : 0;
  
  const activeColor = isMe ? '#E41E3F' : '#FFFFFF'; // Using crimchart primary
  const inactiveColor = isMe ? 'rgba(228, 30, 63, 0.3)' : 'rgba(255, 255, 255, 0.3)';
  const playBtnBg = isMe ? 'rgba(228, 30, 63, 0.1)' : 'rgba(255, 255, 255, 0.1)';

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.playBtn, { backgroundColor: playBtnBg }]} onPress={togglePlay}>
        {isPlaying ? <Pause size={20} color={activeColor} /> : <Play size={20} color={activeColor} fill={activeColor} />}
      </TouchableOpacity>
      
      <View style={styles.waveformContainer} {...panResponder.panHandlers}>
        {waveformHeights.map((h, i) => {
          const isPlayed = (i / 40) <= progress;
          return (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: h * 24,
                  backgroundColor: isPlayed ? activeColor : inactiveColor,
                }
              ]}
            />
          );
        })}
      </View>
      
      <Text style={[styles.time, { color: isMe ? '#FFF' : '#FFF' }]}>
        {isPlaying || position > 0 ? formatDuration(position) : formatDuration(totalDuration)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    maxWidth: 260,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    width: 160,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  bar: {
    width: 2.5,
    borderRadius: 1.25,
  },
  time: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.8,
    marginLeft: 14,
    fontVariant: ['tabular-nums'],
  },
});
