import { useState, useEffect } from 'react';
import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export function useChannelEngagement(channelId: string) {
  const user = (useAuthStore as any).getState?.()?.user;
  const [isFollowing, setIsFollowing] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !channelId) { setIsLoading(false); return; }
    supabase
      .from('channel_members')
      .select('role, is_following')
      .eq('channel_id', channelId)
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setIsFollowing(data?.is_following ?? false);
        setIsLoading(false);
      });
  }, [channelId, user?.id]);

  const followChannel = async () => {
    if (!user) return;
    await supabase.from('channel_members').upsert({ channel_id: channelId, user_id: user.id, is_following: true });
    setIsFollowing(true);
  };

  const unfollowChannel = async () => {
    if (!user) return;
    await supabase.from('channel_members').update({ is_following: false }).eq('channel_id', channelId).eq('user_id', user.id);
    setIsFollowing(false);
  };

  const requestJoin = async () => {
    if (!user) return;
    await supabase.from('channel_join_requests').insert({ channel_id: channelId, user_id: user.id, status: 'pending' });
    setRequestStatus('pending');
  };

  return { isFollowing, requestStatus, isLoading, followChannel, unfollowChannel, requestJoin };
}
