import { channelRepository } from '@/channel/data/channelRepository';
import { ChannelModel } from '@/channel/models/ChannelModel';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useCallback, useState } from 'react';

const PAGE_LIMIT = 20;

export const useExploreChannels = (targetUserId?: string) => {
  const user = useAuthStore(state => state.user);
  const activeUserId = targetUserId || user?.id;
  const [channels, setChannels] = useState<ChannelModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const loadMore = useCallback(async (refresh = false, searchQuery?: string) => {
    if (!activeUserId) return;
    if (!refresh && !hasMore) return;
    if (isLoading) return;

    try {
      setIsLoading(true);
      const currentPage = refresh ? 0 : page;
      
      // If there's a search query, we want to run discovery FIRST to populate DB
      if (searchQuery) {
        await channelRepository.discoverYoutubeChannels(searchQuery);
        // After discovery, we rely on the normal flow below to fetch from DB
      }

      let data;
      
      // If we are looking at someone else's profile, we use the graph centered on them, but filtered for us!
      if (targetUserId && user?.id && targetUserId !== user.id) {
        data = await channelRepository.getProfileSuggestedChannels(targetUserId, user.id, currentPage, PAGE_LIMIT);
      } else {
        data = await channelRepository.getExploreChannels(activeUserId, currentPage, PAGE_LIMIT);
      }

      // If we got NO data, and we haven't already searched, trigger random discovery to fill the tree
      if (data.length < PAGE_LIMIT && !searchQuery) {
        console.log(`[ExploreChannels] Found only ${data.length} channels locally. Triggering discovery edge function...`);
        try {
          await channelRepository.discoverYoutubeChannels();
          // After discovering, fetch again!
          if (targetUserId && user?.id && targetUserId !== user.id) {
            data = await channelRepository.getProfileSuggestedChannels(targetUserId, user.id, currentPage, PAGE_LIMIT);
          } else {
            data = await channelRepository.getExploreChannels(activeUserId, currentPage, PAGE_LIMIT);
          }
        } catch (e) {
          console.error('[ExploreChannels] Error triggering discovery edge function:', e);
        }
      }

      if (refresh) {
        setChannels(data);
      } else {
        // Deduplicate
        setChannels(((prev: ChannelModel[]): ChannelModel[] => {
          const newChannels = data.filter(d => !prev.some(p => p.id === d.id));
          return [...prev, ...newChannels];
        }) as any);
      }

      setHasMore(data.length === PAGE_LIMIT);
      setPage(currentPage + 1);
    } catch (e) {
      console.error('useExploreChannels error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId, hasMore, isLoading, page]);

  return { channels, loadMore, isLoading, hasMore };
};
