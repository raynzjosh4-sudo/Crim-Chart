import { useState, useEffect, useCallback } from 'react';
import { channelRepository } from '@/channel/data/repositories/ChannelRepositoryImpl';
import { useInteractionStore } from '@/core/store/useInteractionStore';

export function useChannelPosts(channelId: string | undefined, limit: number = 10) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async (pageNumber: number, isRefresh: boolean = false, currentPosts: any[] = []) => {
    if (!channelId) {
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // We need to update ChannelRepositoryImpl to pass page and limit if it hasn't been done
      // Assuming channelRepository passes these to remote source:
      const rawData = await channelRepository.getChannelPosts(channelId, pageNumber, limit);

      const mappedPosts = rawData.map((post: any) => ({
        id: post.id,
        title: post.caption || '',
        thumbnailUrl: post.thumbnail_urls?.[0] || post.image_urls?.[0] || null,
        imageUrls: post.image_urls || [],
        videoUrl: post.video_url || post.video_urls?.[0] || null,
        audioUrl: post.audio_url || null,
        isAudio: post.is_audio || false,
        isVideo: post.is_video || false,
        type: post.type || null,
        sourceTable: post.source_table || 'posts',
        aspectRatio: post.aspect_ratio || null,
        metadata: post.metadata || {},
        likes: post.likes || 0,
        commentsCount: post.comments || 0,
        tagsCount: post.tags_count || 0,
        createdAt: post.created_at,
        addedBy: post.author ? {
          id: post.author.id,
          name: post.author.display_name || post.author.username || 'Unknown',
          avatarUrl: post.author.profile_image_url || null,
        } : undefined,
      }));

      if (isRefresh) {
        setPosts(mappedPosts);
      } else {
        setPosts([...currentPosts, ...mappedPosts]);
      }
      useInteractionStore.getState().syncPostInteractions(mappedPosts.map((p: any) => p.id));

      setHasMore(mappedPosts.length === limit);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch channel posts:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [channelId, limit]);

  const refresh = useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchPosts(0, true);
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, false, posts);
    }
  }, [loadingMore, hasMore, page, fetchPosts, posts]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { posts, loading, loadingMore, hasMore, error, refresh, loadMore };
}
