import React, { useRef, useState, useMemo } from 'react';
import { Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface AudioProgressBarProps {
  position: number;
  duration: number;
  primaryColor: string;
  onScrubStart: () => void;
  onScrubMove: (seekMillis: number) => void;
  onScrubRelease: (seekMillis: number) => void;
  style?: any;
  compact?: boolean;
  audioUrl?: string;
}

const formatTime = (millis: number) => {
  if (isNaN(millis) || !isFinite(millis)) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const AudioProgressBar: React.FC<AudioProgressBarProps> = ({
  position,
  duration,
  primaryColor,
  onScrubStart,
  onScrubMove,
  onScrubRelease,
  style,
  compact = false,
  audioUrl,
}) => {
  const [layoutWidth, setLayoutWidth] = useState(width - 60);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: any) => {
        onScrubStart();
        const touchX = evt.nativeEvent.locationX;
        handleScrub(touchX, true);
      },
      onPanResponderMove: (evt: any) => {
        const touchX = evt.nativeEvent.locationX;
        handleScrub(touchX, true);
      },
      onPanResponderRelease: (evt: any) => {
        const touchX = evt.nativeEvent.locationX;
        handleScrub(touchX, false);
      },
      onPanResponderTerminate: (evt: any) => {
        const touchX = evt.nativeEvent.locationX;
        handleScrub(touchX, false);
      }
    })
  ).current;

  const handleScrub = (touchX: number, isMove: boolean) => {
    if (duration === 0) return;
    let progress = touchX / layoutWidth;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    const seekMillis = progress * duration;
    if (isMove) {
      onScrubMove(seekMillis);
    } else {
      onScrubRelease(seekMillis);
    }
  };

  const progressPercent = duration > 0 ? (position / duration) : 0;
  const timeRemaining = duration - position;

  const totalBars = compact ? 30 : 50;

  const waveform = useMemo(() => {
    const seedString = audioUrl || String(duration);
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
      hash = hash & hash;
    }
    const seed = Math.abs(hash) || 12345;
    
    const bars: number[] = [];
    for (let i = 0; i < totalBars; i++) {
      const noise = (Math.sin(seed * (i + 1)) * 10000) % 1;
      const positiveNoise = Math.abs(noise);
      const envelope = Math.sin(Math.PI * (i / totalBars));
      const height = Math.max(0.15, 0.2 + (positiveNoise * envelope * 0.8));
      bars.push(height);
    }
    return bars;
  }, [audioUrl, duration, totalBars]);

  return (
    <View style={[styles.container, compact && styles.compactContainer, style]}>
      {/* Invisible larger hit area for easier scrubbing */}
      <View
        style={[styles.hitArea, compact && styles.compactHitArea]}
        {...panResponder.panHandlers}
        onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
      >
        <View style={styles.waveformContainer}>
          {waveform.map((height, i) => {
            const barProgress = i / totalBars;
            const isPlayed = barProgress <= progressPercent;
            return (
              <View
                key={i}
                style={[
                  styles.bar,
                  { height: `${height * 100}%` },
                  isPlayed ? { backgroundColor: primaryColor } : { backgroundColor: 'rgba(255,255,255,0.2)' }
                ]}
              />
            );
          })}
        </View>
      </View>

      <View style={[styles.timeRow, compact && styles.compactTimeRow]}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    marginTop: 40,
  },
  compactContainer: {
    paddingHorizontal: 0,
    marginTop: 0,
  },
  hitArea: {
    height: 40, // Much larger hit area for fingers
    justifyContent: 'center',
  },
  compactHitArea: {
    height: 30,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 30,
    width: '100%',
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  compactTimeRow: {
    marginTop: 4,
  },
  timeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
});
