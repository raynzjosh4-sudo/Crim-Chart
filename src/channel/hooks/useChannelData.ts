import { channelRepository } from '@/channel/data/repositories/ChannelRepositoryImpl';
import { useEffect, useState } from 'react';
import { channelFromMap } from '../models/ChannelModel';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export function useChannelData(channelId: string | undefined) {
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!channelId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch from local SQLite DB instantly
        const localData = await channelRepository.getLocalChannelById(channelId!);

        if (isMounted) {
          if (localData) {
            setChannel(channelFromMap(localData));
            setLoading(false); // Stop loading early if we have local data
          } else {
            setChannel(null);
          }
        }

        // 2. Fetch fresh data from remote source (Supabase RPC)
        const remoteData = await channelRepository.getChannelDetails(channelId!, user?.id);

        if (isMounted && remoteData) {
          setChannel(remoteData);
          setLoading(false);
          
          // Optionally sync the fresh data back to local SQLite DB
          // channelRepository.updateLocalChannelSettings(channelId!, remoteData);
        }

      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [channelId, user?.id]);

  return { channel, loading, error };
}
