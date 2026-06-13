import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet, Dimensions, Text } from 'react-native';
import { ProfileImageItem } from '@/components/profileTabsWidgets/ProfileImageItem';
import { SkeletonChartCard } from '../widgets/SkeletonChartCard';
import { NativeDB } from '@/core/db/NativeDB';
import { supabase } from '@/core/supabase/client';

interface PhotosProfileTabProps {
  userId?: string;
}

interface PhotoItem {
  id: string;
  image_urls?: string[];
  created_at: string;
}

const { width } = Dimensions.get('window');
const COLS = 3;
const ITEM_SIZE = (width - 4) / COLS;

export const PhotosProfileTab: React.FC<PhotosProfileTabProps> = ({ userId }) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      // 1. Instantly load from local SQLite
      const localData = await NativeDB.getProfileMedia(userId, 'photo');
      if (localData.length > 0) {
        setPhotos(localData);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      // 2. Background fetch fresh from Supabase
      try {
        const { data, error } = await supabase.rpc('get_user_profile_media', {
          p_user_id: userId,
          p_media_type: 'photo',
          p_limit: LIMIT,
          p_offset: 0,
        });

        if (error) throw error;
        
        if (data) {
          await NativeDB.upsertProfileMedia(data, 'photo');
          const parsedItems: PhotoItem[] = data.map((p: any) => ({
            id: p.id,
            image_urls: p.image_urls,
            created_at: p.created_at,
          }));
          setPhotos(parsedItems);
          setOffset(LIMIT);
          setHasMore(data.length === LIMIT);
        }
      } catch (err) {
        console.error('Error fetching photos:', err);
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
        p_media_type: 'photo',
        p_limit: LIMIT,
        p_offset: offset,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        await NativeDB.upsertProfileMedia(data, 'photo');
        
        const newItems: PhotoItem[] = data.map((p: any) => ({
          id: p.id,
          image_urls: p.image_urls,
          created_at: p.created_at,
        }));

        setPhotos(((prev: PhotoItem[]) => {
          const newMap = new Map([...prev, ...newItems].map(p => [p.id, p]));
          return Array.from(newMap.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) as PhotoItem[];
        }) as any);
        setOffset(((prev: number) => prev + LIMIT) as any);
        setHasMore(data.length === LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error paginating photos:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  if (isLoading && photos.length === 0) {
    return (
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonChartCard key={i} width={ITEM_SIZE - 2} height={ITEM_SIZE - 2} />
        ))}
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No photos yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      numColumns={COLS}
      keyExtractor={item => item.id}
      renderItem={({ item }) => {
        const url = (item.image_urls && item.image_urls.length > 0) ? item.image_urls[0] : null;
        return <ProfileImageItem imageUrl={url} size={ITEM_SIZE - 2} />;
      }}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  );
};

const styles = StyleSheet.create({
  grid: { padding: 1, gap: 2 },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    padding: 1,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '600',
  },
});
