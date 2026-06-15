import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';

interface MovieBoxVideoPreviewTileProps {
  key?: React.Key;
  video: {
    id: string;
    thumbnailUrl: string;
    duration: string;
  };
}

export const MovieBoxVideoPreviewTile: React.FC<MovieBoxVideoPreviewTileProps> = ({ video }) => {
  return (
    <View style={styles.videoPreview}>
      <Image source={{ uri: video.thumbnailUrl }} style={styles.videoThumb} contentFit="cover" />
      <View style={styles.durationBadge}>
        <Text style={styles.durationText}>{video.duration}</Text>
      </View>
      <View style={styles.videoOverlay}>
        <Play size={16} color="#FFF" fill="#FFF" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  videoPreview: {
    width: 140,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumb: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
