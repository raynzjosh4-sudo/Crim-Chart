import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TrendingTrack {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  likes: number;
}

interface TrendingInBoxWidgetProps {
  items: TrendingTrack[];
  onTrackPress?: (trackId: string) => void;
}

export const TrendingInBoxWidget = ({ items, onTrackPress }: TrendingInBoxWidgetProps) => {
  // Sort items by likes descending, then pick top 5
  const trendingItems = React.useMemo(() => {
    return [...items].sort((a, b) => b.likes - a.likes).slice(0, 5);
  }, [items]);

  if (trendingItems.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trending in this box</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {trendingItems.map((track, index) => (
          <TouchableOpacity 
            key={track.id} 
            style={styles.card} 
            activeOpacity={0.8}
            onPress={() => onTrackPress?.(track.id)}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: track.thumbnailUrl }} style={styles.image} contentFit="cover" />
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.playOverlay}>
                <Play fill="#FFF" color="#FFF" size={16} style={{ marginLeft: 2 }} />
              </View>
            </View>
            <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 120,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  rankBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rankText: {
    color: '#FACD11',
    fontSize: 10,
    fontWeight: '800',
  },
  playOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  trackArtist: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
  },
});
