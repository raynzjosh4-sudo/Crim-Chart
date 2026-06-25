import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTrendingBoxItems, TrendingTrack } from '../../application/useTrendingBoxItems';
import { TrendingShimmer } from '@/components/shimmers/WidgetShimmers';
import { PaginationShimmer } from '@/components/shimmers/ActivityShimmer';

interface TrendingInBoxWidgetProps {
  boxId: string;
  onTrackPress?: (track: TrendingTrack) => void;
}

export const TrendingInBoxWidget = ({ boxId, onTrackPress }: TrendingInBoxWidgetProps) => {
  const { items, isLoading, isPaginating, loadMore } = useTrendingBoxItems(boxId);

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Trending in this box</Text>
        <TrendingShimmer />
      </View>
    );
  }

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trending in this box</Text>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isPaginating ? <PaginationShimmer /> : null}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.8}
            onPress={() => onTrackPress?.(item)}
          >
            <View style={styles.imageContainer}>
              <Image source={item.thumbnailUrl ? { uri: item.thumbnailUrl } : undefined} style={styles.image} contentFit="cover" />
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.playOverlay}>
                <Play fill="#FFF" color="#FFF" size={16} style={{ marginLeft: 2 }} />
              </View>
            </View>
            <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  card: {
    width: 130,
    marginRight: 16,
  },
  imageContainer: {
    width: 130,
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  rankText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  trackTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  trackArtist: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
});
