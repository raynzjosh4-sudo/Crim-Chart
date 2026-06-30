import React, { useState, useCallback } from 'react';
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
  
  // Use refs to avoid unstable dependencies in useCallback
  const isLoadingRef = React.useRef(false);
  const hasMoreRef = React.useRef(true);
  const pageRef = React.useRef(0);

  // Sync refs with state for UI
  React.useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  React.useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  const loadMore = useCallback(async (refresh = false) => {
    if ((!hasMoreRef.current && !refresh) || isLoadingRef.current || !userId) return;
    if (filterType === 'similar' && !targetUserId) return;

    setIsLoading(true);
    const currentPage = refresh ? 0 : pageRef.current;
    
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
      
      const moreToLoad = data.length === PAGE_LIMIT;
      setHasMore(moreToLoad);
      hasMoreRef.current = moreToLoad;
      pageRef.current = currentPage + 1;
    } catch (e) {
      console.error(`Error fetching ${filterType} channels:`, e);
    } finally {
      setIsLoading(false);
    }
  }, [userId, filterType, targetUserId]);

  return { channels, isLoading, hasMore, loadMore };
};
