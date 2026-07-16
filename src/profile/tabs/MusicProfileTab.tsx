import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Music } from 'lucide-react-native';
import { supabase } from '@/core/supabase/client';
import { SkeletonBox } from '@/components/skeletons/SkeletonBox';
import { NativeDB } from '@/core/db/NativeDB';
import { ProfileMusicItem } from '@/components/profileTabsWidgets/ProfileMusicItem';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { useDesktopNowPlayingStore } from '@/core/store/useDesktopNowPlayingStore';

interface MusicItem {
  id: string;
  thumbnailUrl: string;
  audioUrl: string;
  title?: string;
  artist?: string;
  lyrics?: string;
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
  const router = useRouter();
  const [musicPosts, setMusicPosts] = useState<MusicItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      // 1. Instantly load from local SQLite
      const localData = await NativeDB.getProfileMedia(userId, 'audio');
      if (localData.length > 0) {
        setMusicPosts(localData.map((p: any) => ({
          id: p.id,
          audioUrl: p.audio_url,
          thumbnailUrl: (p.thumbnail_urls && p.thumbnail_urls.length > 0) 
            ? p.thumbnail_urls[0] 
            : 'https://via.placeholder.com/150/1A1A1A/FFFFFF?text=Music',
          title: p.metadata?.title,
          artist: p.metadata?.artist,
        })));
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      // 2. Background fetch fresh from Supabase
      try {
        const { data, error } = await supabase.rpc('get_user_profile_media', {
          p_user_id: userId,
          p_media_type: 'audio',
          p_limit: LIMIT,
          p_offset: 0,
        });

        if (error) {
          console.error('Error fetching music posts:', error);
          return;
        }

        if (data) {
          await NativeDB.upsertProfileMedia(data, 'audio');
          const items: MusicItem[] = data.map((post: any) => ({
            id: post.id,
            audioUrl: post.audio_url,
            thumbnailUrl: (post.thumbnail_urls && post.thumbnail_urls.length > 0) 
              ? post.thumbnail_urls[0] 
              : 'https://via.placeholder.com/150/1A1A1A/FFFFFF?text=Music',
            title: post.metadata?.title,
            artist: post.metadata?.artist,
            lyrics: post.metadata?.lyrics,
          }));
          setMusicPosts(items);
          setOffset(LIMIT);
          setHasMore(data.length === LIMIT);
        }
      } catch (err) {
        console.error('Unexpected error fetching music posts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const loadMore = async () => {
    if (!userId || isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const { data, error } = await supabase.rpc('get_user_profile_media', {
        p_user_id: userId,
        p_media_type: 'audio',
        p_limit: LIMIT,
        p_offset: offset,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        await NativeDB.upsertProfileMedia(data, 'audio');
        const newItems: MusicItem[] = data.map((post: any) => ({
          id: post.id,
          audioUrl: post.audio_url,
          thumbnailUrl: (post.thumbnail_urls && post.thumbnail_urls.length > 0) 
            ? post.thumbnail_urls[0] 
            : 'https://via.placeholder.com/150/1A1A1A/FFFFFF?text=Music',
          title: post.metadata?.title,
          artist: post.metadata?.artist,
          lyrics: post.metadata?.lyrics,
        }));
        
        setMusicPosts(((prev: MusicItem[]) => {
          const newMap = new Map([...prev, ...newItems].map(m => [m.id, m]));
          return Array.from(newMap.values());
        }) as any);
        
        setOffset(((prev: number) => prev + LIMIT) as any);
        setHasMore(data.length === LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error paginating music:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <View key={i} style={{ width: '33.33%', aspectRatio: 0.6, padding: 1 }}>
            <SkeletonBox width="100%" height="100%" />
          </View>
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
      scrollEnabled={false}
      numColumns={COLS}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={{ flex: 1/3, padding: 1 }}>
          <ProfileMusicItem
            thumbnailUrl={item.thumbnailUrl}
            title={item.title}
            artist={item.artist}
            size="100%"
            onPress={() => {
              if (onMusicPress) {
                onMusicPress(item);
              }
              const queue = musicPosts.map(p => ({
                title: p.title,
                artist: p.artist,
                coverUrl: p.thumbnailUrl,
                audioUrl: p.audioUrl,
                lyrics: p.lyrics,
                postId: p.id,
              }));
              const startIndex = Math.max(0, musicPosts.findIndex(p => p.id === item.id));
              
              useDesktopNowPlayingStore.getState().openModal(queue, startIndex);
            }}
          />
        </View>
      )}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  );
};

const styles = StyleSheet.create({
  grid: { padding: 1, gap: 2 },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 1 },
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
