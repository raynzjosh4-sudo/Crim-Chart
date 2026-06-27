import { useCallback, useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

interface VideoScrubberProps {
  player: any;
  hideBottomInput: boolean;
  preloadStatus: 'playing' | 'preloading' | 'idle';
  isPausedByUserRef: React.MutableRefObject<boolean>;
  onScrubbingChange?: (isScrubbing: boolean) => void;
}

export const VideoScrubber = ({
  player,
  hideBottomInput,
  preloadStatus,
  isPausedByUserRef,
  onScrubbingChange,
}: VideoScrubberProps) => {
  const [progress, setProgress] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  useEffect(() => {
    onScrubbingChange?.(isScrubbing);
  }, [isScrubbing, onScrubbingChange]);

  useEffect(() => {
    if (!player) return;
    const subscription = player.addListener('timeUpdate', (event: any) => {
      try {
        if (player.duration > 0 && !isScrubbing) {
          const current = event.currentTime ?? player.currentTime;
          setProgress((current / player.duration) * 100);
        }
      } catch (e) { }
    });
    return () => {
      subscription.remove();
    };
  }, [player, isScrubbing]);

  const handleScrub = useCallback((evt: any) => {
    if (!player || player.duration <= 0) return;
    const touchX = evt.nativeEvent.pageX;
    let newProgress = (touchX / SCREEN_W) * 100;
    newProgress = Math.max(0, Math.min(100, newProgress));
    setProgress(newProgress);
    player.currentTime = (newProgress / 100) * player.duration;
  }, [player]);

  const onScrubGrant = useCallback((evt: any) => {
    setIsScrubbing(true);
    handleScrub(evt);
    player?.pause();
  }, [handleScrub, player]);

  const onScrubMove = useCallback((evt: any) => {
    handleScrub(evt);
  }, [handleScrub]);

  const onScrubRelease = useCallback(() => {
    setIsScrubbing(false);
    if (!isPausedByUserRef.current && preloadStatus === 'playing') {
      player?.play();
    }
  }, [player, preloadStatus, isPausedByUserRef]);

  return (
    <View
      style={[
        styles.progressBarContainer,
        hideBottomInput ? { bottom: 0 } : { bottom: 58 },
        isScrubbing && { height: 16 }
      ]}
      pointerEvents="auto"
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={onScrubGrant}
      onResponderMove={onScrubMove}
      onResponderRelease={onScrubRelease}
      onResponderTerminate={onScrubRelease}
    >
      <View style={[styles.progressBarFill, { width: `${progress}%` }, isScrubbing && { height: 4, backgroundColor: '#FF0050', marginTop: 6 }]}>
        <View style={[styles.scrubberDot, !isScrubbing && { opacity: 0 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 16, // Extra hit area above the bar
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  progressBarFill: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.7)',
    position: 'absolute',
    left: 0,
    bottom: 4.5, // Push line up so dot fits
  },
  scrubberDot: {
    position: 'absolute',
    right: -6,
    bottom: 0, // Dot touches absolute bottom edge so it doesn't clip
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
});
