import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Play } from 'lucide-react-native';
import { pickVideoThumbnail } from '@/components/youtubethambnailexatractor/videoThumbnailHelper';

interface ChannelVideoPostWidgetProps {
  videoUrl: string;
  thumbnail?: string | null;
  sideThumbnails?: string[] | null;
  aspectRatio?: number | null;
}

export const ChannelVideoPostWidget: React.FC<ChannelVideoPostWidgetProps> = ({
  videoUrl,
  thumbnail,
  sideThumbnails,
  aspectRatio,
}) => {
  const aspect = aspectRatio ?? 16 / 9;

  const resolvedThumbnail = React.useMemo(() => {
    return pickVideoThumbnail({
      explicitThumbnail: thumbnail,
      sideThumbnails: sideThumbnails,
      videoUrl: videoUrl,
      preferYouTubeMaxRes: true,
    });
  }, [thumbnail, sideThumbnails, videoUrl]);

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.9} style={[styles.videoContainer, { aspectRatio: aspect }]}>
        {resolvedThumbnail ? (
          <Image source={{ uri: resolvedThumbnail }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1A1A1A' }]} />
        )}
        <View style={styles.playButtonContainer}>
          <Play size={32} color="#FFF" fill="#FFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  videoContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1A1A1A',
  },
  playButtonContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }], // 48x48 centered
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
