import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '@react-navigation/native';

interface VideoThumbnailProps {
  videoUrl: string;
  visibilityThreshold?: number; // Simplified in React Native
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ videoUrl }) => {
  const { colors } = useTheme();
  
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {player ? (
        <VideoView 
          style={StyleSheet.absoluteFill} 
          player={player} 
          nativeControls={false}
        />
      ) : (
        <ActivityIndicator color={colors.text} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


