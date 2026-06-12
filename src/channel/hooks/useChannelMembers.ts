import { useState, useEffect } from 'react';
import { channelRemoteSource } from '@/channel/data/sources/ChannelRemoteSource';
import { ChannelMemberModel } from '@/channel/models/ChannelMemberModel';

export function useChannelMembers(channelId: string) {
  const [members, setMembers] = useState<ChannelMemberModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!channelId) return;
    channelRemoteSource.getChannelMembers(channelId)
      .then(setMembers)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [channelId]);

  return { members, isLoading, error };
}
