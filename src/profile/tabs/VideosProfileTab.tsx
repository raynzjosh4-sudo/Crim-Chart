import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Play } from 'lucide-react-native';
import { SkeletonChartCard } from '../widgets/SkeletonChartCard';
import { SkeletonBox } from '@/components/skeletons/SkeletonBox';
import { NativeDB } from '@/core/db/NativeDB';
import { supabase } from '@/core/supabase/client';
import { ProfileVideoItem } from '@/components/profileTabsWidgets/ProfileVideoItem';

interface VideoItem {
  id: string;
  thumbnailUrl: string;
  durationLabel?: string;
  videoUrl?: string;
}

interface VideosProfileTabProps {
  userId?: string;
  onVideoPress?: (video: VideoItem) => void;
}

const { width } = Dimensions.get('window');
const COLS = 3;
const ITEM_SIZE = (width - 4) / COLS;

export const VideosProfileTab: React.FC<VideosProfileTabProps> = ({
  userId,
  onVideoPress,
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      // 1. Instantly load from local SQLite
      const localData = await NativeDB.getProfileMedia(userId, 'video');
      if (localData.length > 0) {
        setVideos(localData.map((p: any) => ({
          id: p.id,
          thumbnailUrl: (p.thumbnail_urls && p.thumbnail_urls.length > 0) ? p.thumbnail_urls[0] : (p.image_urls?.[0] || ''),
          videoUrl: p.video_url,
        })));
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      // 2. Background fetch fresh from Supabase
      try {
        const { data, error } = await supabase.rpc('get_user_profile_media', {
          p_user_id: userId,
          p_media_type: 'video',
          p_limit: LIMIT,
          p_offset: 0,
        });

        if (error) throw error;
        
        if (data) {
          await NativeDB.upsertProfileMedia(data, 'video');
          setVideos(data.map((p: any) => ({
            id: p.id,
            thumbnailUrl: (p.thumbnail_urls && p.thumbnail_urls.length > 0) ? p.thumbnail_urls[0] : (p.image_urls?.[0] || ''),
            videoUrl: p.video_url,
          })));
          setOffset(LIMIT);
          setHasMore(data.length === LIMIT);
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
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
        p_media_type: 'video',
        p_limit: LIMIT,
        p_offset: offset,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        await NativeDB.upsertProfileMedia(data, 'video');
        
        const newItems = data.map((p: any) => ({
          id: p.id,
          thumbnailUrl: (p.thumbnail_urls && p.thumbnail_urls.length > 0) ? p.thumbnail_urls[0] : (p.image_urls?.[0] || ''),
          videoUrl: p.video_url,
        }));
        
        setVideos(((prev: VideoItem[]) => {
          const newMap = new Map([...prev, ...newItems].map(v => [v.id, v]));
          return Array.from(newMap.values());
        }) as any);
        
        setOffset(((prev: number) => prev + LIMIT) as any);
        setHasMore(data.length === LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error paginating videos:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  if (isLoading && videos.length === 0) {
    return (
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <View key={i} style={{ width: '33.33%', aspectRatio: 2/3, padding: 1 }}>
            <SkeletonBox width="100%" height="100%" />
          </View>
        ))}
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Play color="rgba(255,255,255,0.2)" size={48} />
        <Text style={styles.emptyText}>No video posts yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      scrollEnabled={false}
      numColumns={COLS}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={{ flex: 1/3, padding: 1 }}>
          <ProfileVideoItem
            thumbnailUrl={item.thumbnailUrl}
            videoUrl={item.videoUrl}
            durationLabel={item.durationLabel}
            size="100%"
            onPress={() => onVideoPress?.(item)}
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
