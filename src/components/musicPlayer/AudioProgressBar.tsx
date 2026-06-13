import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface AudioProgressBarProps {
  position: number;
  duration: number;
  primaryColor: string;
  onScrubStart: () => void;
  onScrubMove: (seekMillis: number) => void;
  onScrubRelease: (seekMillis: number) => void;
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

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;
  const timeRemaining = duration - position;

  return (
    <View style={styles.container}>
      {/* Invisible larger hit area for easier scrubbing */}
      <View 
        style={styles.hitArea} 
        {...panResponder.panHandlers}
        onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
      >
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: primaryColor }]} />
          <View style={[styles.progressThumb, { backgroundColor: primaryColor, left: `${progressPercent}%` }]} />
        </View>
      </View>
      
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>-{formatTime(timeRemaining)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    marginTop: 40,
  },
  hitArea: {
    height: 40, // Much larger hit area for fingers
    justifyContent: 'center',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
    pointerEvents: 'none', // let the hitArea handle touches
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressThumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: -4,
    marginLeft: -6, // center the thumb exactly on the edge
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});
