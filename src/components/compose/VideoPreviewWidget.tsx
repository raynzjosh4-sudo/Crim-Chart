import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

interface VideoPreviewWidgetProps {
  media: any;
}

export const VideoPreviewWidget: React.FC<VideoPreviewWidgetProps> = ({ media }) => {
  const player = useVideoPlayer(media.uri, player => {
    player.loop = true;
  });

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
