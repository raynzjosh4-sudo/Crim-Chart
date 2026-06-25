import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');

interface VideoFeedItemProps {
  manifestUrl: string; // The .m3u8 HLS master playlist URL
  isActive: boolean;   // Whether this specific item is currently centered on screen
  height?: number;     // Allow custom height (useful for tab bars or safe areas)
}

export default function VideoFeedItem({ manifestUrl, isActive, height = WINDOW_HEIGHT }: VideoFeedItemProps) {
  // Create the player instance. It instantly handles ABR (Adaptive Bitrate) 
  // and interacts directly with the device's hardware decoders.
  const player = useVideoPlayer(manifestUrl, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = false;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
      // Optional: Reset to start so it's fresh when scrolled back
      player.currentTime = 0; 
    }
  }, [isActive, player]);

  return (
    <View style={[styles.container, { height }]}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        allowsFullscreen={false}
        showsPlaybackControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: WINDOW_WIDTH,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
