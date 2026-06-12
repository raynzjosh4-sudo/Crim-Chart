import { useState, useCallback } from 'react';
import { ChannelModel } from '@/channel/models/ChannelModel';
import { channelRepository } from '@/channel/data/channelRepository';

const PAGE_LIMIT = 10;

export type ChannelData = { channel: ChannelModel; type: string };

export const useUserChannels = (
  userId: string, 
  filterType: 'owned' | 'joined' | 'similar', 
  targetUserId?: string
) => {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const loadMore = useCallback(async (refresh = false) => {
    if ((!hasMore && !refresh) || isLoading || !userId) return;
    if (filterType === 'similar' && !targetUserId) return;

    setIsLoading(true);
    const currentPage = refresh ? 0 : page;
    
    try {
      const data = await channelRepository.fetchUserChannels(userId, filterType, currentPage, targetUserId, PAGE_LIMIT);
      
      if (refresh) {
        setChannels(data);
      } else {
        // Simple deduplication based on ID
        setChannels(((prev: ChannelData[]): ChannelData[] => {
          const newChannels = data.filter((d: ChannelData) => !prev.some(p => p.channel.id === d.channel.id));
          return [...prev, ...newChannels];
        }) as any);
      }

      // Save all fetched channels to the local database
      const channelsToSave = data.map(d => d.channel);
      if (channelsToSave.length > 0) {
        const { channelLocalSource } = require('@/channel/data/sources/ChannelLocalSource');
        channelLocalSource.saveChannels(channelsToSave).catch(console.error);
      }
      
      setHasMore(data.length === PAGE_LIMIT);
      setPage(currentPage + 1);
    } catch (e) {
      console.error(`Error fetching ${filterType} channels:`, e);
    } finally {
      setIsLoading(false);
    }
  }, [userId, filterType, targetUserId, page, hasMore, isLoading]);

  return { channels, isLoading, hasMore, loadMore };
};
