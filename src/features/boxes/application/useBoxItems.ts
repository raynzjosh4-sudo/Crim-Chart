import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { NativeDB } from '@/core/db/NativeDB';

export interface BoxItemModel {
  id: string;
  box_id: string;
  post_id: string;
  likes: number;
  dislikes: number;
  addedAt: string;
  addedBy: {
    id: string;
    name: string;
    avatarUrl: string;
  } | null;
  post: {
    id: string;
    caption: string;
    mediaUrl: string;
    thumbnailUrl: string;
    isVideo: boolean;
    authorId: string;
    authorName: string;
    authorAvatar: string;
  };
}

const CACHE_LIMIT = 10;

export function useBoxItems(boxId: string) {
  const [items, setItems] = useState<BoxItemModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Load initial cache
  useEffect(() => {
    if (!boxId) return;

    let isMounted = true;
    
    const loadFromCache = async () => {
      try {
        const cached = await NativeDB.getBoxItems(boxId);
        if (isMounted && cached && cached.length > 0) {
          // Transform local SQLite rows back to BoxItemModel
          const parsed = cached.map(row => ({
            id: row.id,
            box_id: row.box_id,
            post_id: row.post_id,
            likes: row.likes_count,
            dislikes: row.dislikes_count,
            addedAt: row.added_at,
            addedBy: row.added_by_id ? {
              id: row.added_by_id,
              name: row.added_by_name,
              avatarUrl: row.added_by_avatar
            } : null,
            post: {
              id: row.post_id,
              caption: row.caption,
              mediaUrl: row.media_url,
              thumbnailUrl: row.thumbnail_url,
              isVideo: row.is_video === 1,
              authorId: row.author_id,
              authorName: row.author_name,
              authorAvatar: row.author_avatar
            }
          }));
          setItems(parsed);
          setIsLoading(false); // Instantly ready from cache!
        }
      } catch (err) {
        console.error('[useBoxItems] Error loading cache:', err);
      }
    };

    loadFromCache();
    fetchNetworkItems(0); // Trigger background sync for fresh data

    return () => { isMounted = false; };
  }, [boxId]);

  const fetchNetworkItems = useCallback(async (targetPage: number) => {
    if (!boxId) return;

    if (targetPage === 0) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const { data, error } = await supabase.rpc('get_box_items_with_details', {
        p_box_id: boxId,
        p_limit: CACHE_LIMIT,
        p_offset: targetPage * CACHE_LIMIT
      });

      if (error) throw error;

      // if (targetPage === 0 && data && data.length > 0) {
      //   console.log('\n=== RAW DB ITEM STRUCTURE (1st Item) ===');
      //   console.log(JSON.stringify(data[0], null, 2));
      //   console.log('==========================================\n');
      // }

      // 4. Transform to frontend model
      const networkItems: BoxItemModel[] = (data || []).map((row: any) => ({
        id: row.id,
        box_id: row.box_id,
        post_id: row.post_id,
        likes: row.likes_count || 0,
        dislikes: row.dislikes_count || 0,
        addedAt: row.added_at,
        addedBy: row.added_by ? {
          id: row.added_by.id,
          name: row.added_by.name,
          avatarUrl: row.added_by.avatarUrl
        } : null,
        post: {
          id: row.post.id,
          caption: row.post.caption,
          mediaUrl: row.post.media_url,
          thumbnailUrl: Array.isArray(row.post.thumbnail_url) 
            ? row.post.thumbnail_url[0] || '' 
            : (row.post.thumbnail_url || ''),
          isVideo: row.post.is_video,
          authorId: row.post.author_id,
          authorName: row.post.author_name,
          authorAvatar: row.post.author_avatar
        }
      }));

      // Cache the first page locally
      if (targetPage === 0) {
        await NativeDB.saveBoxItems(boxId, networkItems);
        setItems(networkItems);
      } else {
        setItems(((prev: BoxItemModel[]) => {
          // simple dedup just in case
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = networkItems.filter(n => !existingIds.has(n.id));
          return [...prev, ...newItems];
        }) as any);
      }

      setHasMore(networkItems.length === CACHE_LIMIT);
      setPage(targetPage);
    } catch (err) {
      console.error('[useBoxItems] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [boxId]);

  const loadMore = () => {
    if (!hasMore || isLoading || isFetchingMore) return;
    fetchNetworkItems(page + 1);
  };

  return { items, isLoading, isFetchingMore, loadMore };
}
