import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface MovieBoxVideoPreviewTileProps {
  key?: React.Key;
  video: {
    id: string;
    post_id?: string;
    thumbnailUrl: string;
    duration?: string;
  };
}

import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';

export const MovieBoxVideoPreviewTile: React.FC<MovieBoxVideoPreviewTileProps> = ({ video }) => {
  const router = useRouter();
  const { startLoading, stopLoading } = useGlobalProgress();
  
  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={styles.videoPreview}
      onPress={() => {
        if (video.post_id) {
          startLoading();
          setTimeout(() => {
            router.push(`/post/${video.post_id}` as any);
            stopLoading();
          }, 400);
        }
      }}
    >
      {video.thumbnailUrl ? (
        <Image source={{ uri: video.thumbnailUrl }} style={styles.videoThumb} contentFit="cover" />
      ) : (
        <View style={[styles.videoThumb, { backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' }]}>
          <Play size={24} color="rgba(255,255,255,0.2)" />
        </View>
      )}
      {video.duration ? (
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      ) : null}
      <View style={styles.videoOverlay}>
        <Play size={16} color="#FFF" fill="#FFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  videoPreview: {
    width: 140,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#333',
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
