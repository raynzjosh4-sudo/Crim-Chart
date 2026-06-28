import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useEventListener } from 'expo';
import { VideoPlayer } from 'expo-video';

interface Props {
  player: VideoPlayer | null;
}

export const VideoBufferingSpinner: React.FC<Props> = ({ player }) => {
  const [isBuffering, setIsBuffering] = useState(player?.status === 'loading');

  // Sync initial state if player changes
  useEffect(() => {
    if (player) {
      setIsBuffering(player.status === 'loading');
    }
  }, [player]);

  // Listen for native status changes
  useEventListener(player ?? ({} as any), 'statusChange', (event: any) => {
    setIsBuffering(event.status === 'loading');
  });

  if (!isBuffering || !player) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.spinnerBg}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  spinnerBg: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 50,
  },
});
