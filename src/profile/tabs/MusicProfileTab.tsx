import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Music } from 'lucide-react-native';
import { supabase } from '@/core/supabase/client';
import { SkeletonChartCard } from '../widgets/SkeletonChartCard';

interface MusicItem {
  id: string;
  thumbnailUrl: string;
  audioUrl: string;
}

interface MusicProfileTabProps {
  userId?: string;
  onMusicPress?: (music: MusicItem) => void;
}

const { width } = Dimensions.get('window');
const COLS = 3;
const ITEM_SIZE = (width - 4) / COLS;

export const MusicProfileTab: React.FC<MusicProfileTabProps> = ({
  userId,
  onMusicPress,
}) => {
  const [musicPosts, setMusicPosts] = useState<MusicItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchMusic = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('posts')
          .select('id, audio_url, thumbnail_urls')
          .eq('author_id', userId)
          .eq('is_audio', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching music posts:', error);
          return;
        }

        const items: MusicItem[] = (data || []).map(post => ({
          id: post.id,
          audioUrl: post.audio_url,
          thumbnailUrl: (post.thumbnail_urls && post.thumbnail_urls.length > 0) 
            ? post.thumbnail_urls[0] 
            : 'https://via.placeholder.com/150/1A1A1A/FFFFFF?text=Music',
        }));

        setMusicPosts(items);
      } catch (err) {
        console.error('Unexpected error fetching music posts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusic();
  }, [userId]);

  if (isLoading) {
    return (
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonChartCard key={i} width={ITEM_SIZE - 2} height={ITEM_SIZE - 2} />
        ))}
      </View>
    );
  }

  if (musicPosts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Music color="rgba(255,255,255,0.2)" size={48} />
        <Text style={styles.emptyText}>No music posts yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={musicPosts}
      numColumns={COLS}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.musicItem, { width: ITEM_SIZE - 2, height: ITEM_SIZE - 2 }]}
          onPress={() => onMusicPress?.(item)}
          activeOpacity={0.85}
        >
          <Image source={{ uri: item.thumbnailUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <View style={styles.playOverlay}>
            <Music color="#FFF" size={24} />
          </View>
        </TouchableOpacity>
      )}
      contentContainerStyle={{ padding: 1, gap: 2 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, padding: 1 },
  musicItem: {
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: '#1A1A1A',
    position: 'relative',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});
