import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

interface VoiceMessagePlayerProps {
  url: string;
  duration?: number; // Duration in seconds
  isMe?: boolean;
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
  for (let i = 0; i < 40; i++) {
    let h = 0.2 + random() * 0.8;
    if (i < 3) h *= (i + 1) / 4;
    if (i > 36) h *= (40 - i) / 4;
    heights.push(Math.max(0.1, Math.min(h, 1.0)));
  }
  return heights;
};

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  url,
  duration = 0,
  isMe = false,
}) => {
  // We'll mock the actual playing for now. You can integrate expo-av later.
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0); // in seconds
  const totalDuration = duration || 12; // fallback 12 seconds
  const heights = useRef(generateHeights(url)).current;

  // Use a ref to track position inside the interval without functional updates
  const positionRef = useRef(position);
  positionRef.current = position;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        const prev = positionRef.current;
        if (prev >= totalDuration) {
          setIsPlaying(false);
          setPosition(0);
        } else {
          setPosition(prev + 0.1);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const activeColor = isMe ? colors.primary : '#FFF';
  const inactiveColor = isMe ? 'rgba(250, 205, 17, 0.3)' : 'rgba(255,255,255,0.3)';
  const playBtnBg = isMe ? 'rgba(250, 205, 17, 0.1)' : '#2A2A2A';
  const playBtnIconColor = isMe ? colors.primary : '#FFF';

  const progress = totalDuration > 0 ? Math.min(position / totalDuration, 1.0) : 0;

  return (
    <View style={styles.container}>
      {/* Play/Pause Button */}
      <TouchableOpacity
        onPress={togglePlay}
        style={[styles.playBtn, { backgroundColor: playBtnBg }]}
      >
        {isPlaying ? (
          <Pause fill={playBtnIconColor} color={playBtnIconColor} size={20} />
        ) : (
          <Play fill={playBtnIconColor} color={playBtnIconColor} size={20} style={{ marginLeft: 2 }} />
        )}
      </TouchableOpacity>

      {/* Waveform */}
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
                  backgroundColor: isPlayed ? activeColor : inactiveColor,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Duration */}
      <Text style={styles.timeText}>
        {isPlaying || position > 0 ? formatDuration(position) : formatDuration(totalDuration)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 260,
    paddingVertical: 6,
    paddingHorizontal: 4,
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
    flex: 1,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bar: {
    width: 2.5,
    borderRadius: 2,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 14,
    minWidth: 35,
  },
});
