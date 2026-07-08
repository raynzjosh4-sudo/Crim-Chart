import { useState, useEffect, useCallback } from 'react';
import { channelRepository } from '../data/channelRepository';

export const useChannelRequests = (channelId: string) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!channelId) return;
    try {
      setLoading(true);
      const data = await channelRepository.getPendingChannelRequests(channelId);
      setRequests(data);
    } catch (e) {
      console.error('Failed to fetch channel requests:', e);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected' | 'canceled') => {
    try {
      await channelRepository.updateChannelRequestStatus(requestId, status);
      // Optimistically remove from list
      setRequests(requests.filter(req => req.id !== requestId));
    } catch (e) {
      console.error('Failed to update request status:', e);
      throw e;
    }
  };

  return { requests, loading, updateRequestStatus, refetch: fetchRequests };
};
