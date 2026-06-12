import React from 'react';
import { FlatList, View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Play } from 'lucide-react-native';
import { SkeletonChartCard } from '../widgets/SkeletonChartCard';

interface VideoItem {
  id: string;
  thumbnailUrl: string;
  durationLabel?: string;
}

interface VideosProfileTabProps {
  userId?: string;
  videos?: VideoItem[];
  isLoading?: boolean;
  onVideoPress?: (video: VideoItem) => void;
}

const { width } = Dimensions.get('window');
const COLS = 3;
const ITEM_SIZE = (width - 4) / COLS;

export const VideosProfileTab: React.FC<VideosProfileTabProps> = ({
  videos = [],
  isLoading = false,
  onVideoPress,
}) => {
  if (isLoading) {
    return (
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonChartCard key={i} width={ITEM_SIZE - 2} height={ITEM_SIZE - 2} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      numColumns={COLS}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.videoItem, { width: ITEM_SIZE - 2, height: ITEM_SIZE - 2 }]}
          onPress={() => onVideoPress?.(item)}
          activeOpacity={0.85}
        >
          <Image source={{ uri: item.thumbnailUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <View style={styles.playOverlay}>
            <Play color="#FFF" size={18} fill="#FFF" />
          </View>
          {item.durationLabel && (
            <Text style={styles.duration}>{item.durationLabel}</Text>
          )}
        </TouchableOpacity>
      )}
      contentContainerStyle={{ padding: 1, gap: 2 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, padding: 1 },
  videoItem: {
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: '#1A1A1A',
    position: 'relative',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  duration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
});
