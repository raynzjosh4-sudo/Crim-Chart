import { useState, useEffect, useCallback } from 'react';
import { channelRepository } from '@/channel/data/repositories/ChannelRepositoryImpl';
import { channelStatusFromMap, ChannelStatusModel } from '@/channel/models/ChannelStatusModel';
import { StatusItem } from '@/components/UserStatusWidget/UserStatusWidget';

export function useChannelStatuses(channelId: string | undefined) {
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatuses = useCallback(async () => {
    if (!channelId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const rawData = await channelRepository.getChannelStatuses(channelId);
      
      const mappedStatuses = rawData.map(channelStatusFromMap);

      // Group by author for WhatsApp style (one circle per user)
      const groupedMap = new Map<string, StatusItem>();

      mappedStatuses.forEach((status) => {
        if (!status.author) return;

        if (!groupedMap.has(status.authorId)) {
          groupedMap.set(status.authorId, {
            id: status.authorId, // Group ID is the user ID
            user: status.author,
            thumbnailUrl: status.thumbnailUrl || status.imageUrls?.[0] || 'https://via.placeholder.com/150',
            hasUnseen: true, // We'd ideally track seen states locally
            statuses: [status]
          } as StatusItem & { statuses: ChannelStatusModel[] });
        } else {
          // Add subsequent statuses to the group
          const group = groupedMap.get(status.authorId)!;
          (group as any).statuses.push(status);
        }
      });

      setStatuses(Array.from(groupedMap.values()));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch channel statuses:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  return {
    statuses,
    loading,
    error,
    refresh: fetchStatuses,
  };
}
