import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/core/supabase/client';
import { MediaData, MediaType } from '@/components/media/types';
import DataCard from '@/components/media/DataCard';
import { colors } from '@/core/theme/colors';

interface YourDataTabProps {
  selectedIndices: number[];
  onMediaTap: (index: number, item: MediaData) => void;
  targetUserId?: string;
  onlyPublic?: boolean;
}

const FETCH_LIMIT = 15;
const NUM_COLUMNS = 3;

export default function YourDataTab({
  selectedIndices,
  onMediaTap,
  targetUserId,
  onlyPublic = false,
}: YourDataTabProps) {
  const [items, setItems] = useState<MediaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [exhausted, setExhausted] = useState(false);

  useEffect(() => {
    fetchMedia(true);
  }, [targetUserId]);

  const fetchMedia = async (reset = false) => {
    if (reset) {
      setIsLoading(true);
      setOffset(0);
      setExhausted(false);
    } else {
      if (exhausted) return;
      setIsLoadingMore(true);
    }

    try {
      const userId =
        targetUserId ?? supabase.auth.getUser().then(r => r.data.user?.id);

      const resolvedUserId =
        typeof userId === 'string'
          ? userId
          : (await supabase.auth.getUser()).data.user?.id;

      if (!resolvedUserId) throw new Error('Not authenticated');

      const currentOffset = reset ? 0 : offset;

      let query = supabase
        .from('posts')
        .select('*')
        .eq('author_id', resolvedUserId);

      if (onlyPublic) {
        query = query.eq('privacy', 'public');
      }

      const { data: posts, error } = await query
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + FETCH_LIMIT - 1);

      if (error) throw error;

      const loaded: MediaData[] = [];
      for (const post of posts ?? []) {
        const imageUrls: string[] = post.image_urls ?? [];
        const thumbUrls: string[] = post.thumbnail_urls ?? [];
        const videoUrl: string | null = post.video_url ?? null;
        const isVideo: boolean = post.is_video === true;
        const postId: string = post.id.toString();

        let mainContent: string | null = null;
        let thumb: string | null = null;

        if (isVideo && videoUrl) {
          mainContent = videoUrl;
          thumb = thumbUrls[0] ?? null;
        } else if (imageUrls.length > 0) {
          mainContent = imageUrls[0];
          thumb = thumbUrls[0] ?? null;
        }

        if (mainContent) {
          loaded.push({
            type: isVideo ? MediaType.video : MediaType.image,
            contentUrl: mainContent,
            thumbnailUrl: thumb ?? undefined,
            postId,
          });
        }
      }

      setItems(prev => (reset ? loaded : [...prev, ...loaded]));
      if (loaded.length < FETCH_LIMIT) setExhausted(true);
      setOffset(currentOffset + FETCH_LIMIT);
    } catch (e) {
      console.error('Error fetching user media:', e);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          {'No media available yet.\nStart posting to see your gallery!'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item, index) => `${item.postId ?? index}`}
        contentContainerStyle={styles.grid}
        onEndReached={() => fetchMedia(false)}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.primary} size="small" />
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <View style={styles.cardWrapper}>
            <DataCard
              mediaData={item}
              isSelected={selectedIndices.includes(index)}
              onTap={() => onMediaTap(index, item)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  grid: { padding: 20, gap: 12 },
  cardWrapper: {
    flex: 1 / NUM_COLUMNS,
    margin: 6,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
