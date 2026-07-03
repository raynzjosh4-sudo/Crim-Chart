import { useState, useEffect, useCallback, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { channelRepository } from '@/channel/data/repositories/ChannelRepositoryImpl';
import { channelLocalSource } from '@/channel/data/sources/ChannelLocalSource';
import { channelStatusFromMap, ChannelStatusModel } from '@/channel/models/ChannelStatusModel';
import { StatusItem } from '@/components/UserStatusWidget/UserStatusWidget';
import { useViewedStatusStore } from '@/core/store/useViewedStatusStore';

export function useChannelStatuses(channelId: string | undefined) {
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Pagination
  const page = useRef(0);
  const hasMore = useRef(true);
  const rawStatusesMap = useRef<Map<string, any>>(new Map());

  const processAndSetStatuses = (rawData: any[]) => {
    const viewedStatusIds = useViewedStatusStore.getState().viewedStatusIds;
    // Merge new raw data into our map
    rawData.forEach(item => {
      rawStatusesMap.current.set(item.id, item);
    });

    const mappedStatuses = Array.from(rawStatusesMap.current.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(channelStatusFromMap);

    const groupedMap = new Map<string, StatusItem>();

    mappedStatuses.forEach((status) => {
      if (!status.author) return;

      if (!groupedMap.has(status.authorId)) {
        groupedMap.set(status.authorId, {
          id: status.authorId,
          user: status.author,
          thumbnailUrl: status.thumbnailUrl || status.imageUrls?.[0] || 'https://via.placeholder.com/150',
          hasUnseen: false, // Default to false
          statuses: [status]
        } as StatusItem & { statuses: ChannelStatusModel[] });
      } else {
        const group = groupedMap.get(status.authorId)!;
        (group as any).statuses.push(status);
      }
    });

    const result = Array.from(groupedMap.values());
    result.forEach(group => {
      group.hasUnseen = group.statuses!.some(s => !viewedStatusIds[s.id]);
    });
    setStatuses(result);
  };

  const loadData = useCallback(async (isRefresh = false) => {
    if (!channelId) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      page.current = 0;
      hasMore.current = true;
      rawStatusesMap.current.clear();
      setStatuses([]);
    }

    if (!hasMore.current && !isRefresh) return;

    try {
      setLoading(true);

      // Offline-first approach on initial load
      if (page.current === 0 && isRefresh) {
        const localData = await channelLocalSource.getChannelStatuses(channelId, 10, 0);
        if (localData.length > 0) {
          processAndSetStatuses(localData);
        }
      }

      // Fetch remote
      const remoteData = await channelRepository.getChannelStatuses(channelId, page.current, 10);
      
      if (remoteData.length > 0) {
        // Save to local cache asynchronously
        channelLocalSource.saveChannelStatuses(remoteData).catch(console.warn);
        processAndSetStatuses(remoteData);
        page.current += 1;
      } else {
        hasMore.current = false;
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch channel statuses:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    loadData(true);

    const handleStatusPosted = () => loadData(true);
    const sub = DeviceEventEmitter.addListener('channel_status_posted', handleStatusPosted);
    return () => sub.remove();
  }, [loadData]);

  return {
    statuses,
    loading,
    error,
    refresh: () => loadData(true),
    loadMore: () => loadData(false),
  };
}
