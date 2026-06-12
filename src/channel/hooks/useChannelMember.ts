import { useState, useEffect } from 'react';
import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export function useChannelMember(channelId: string) {
  const user = (useAuthStore as any).getState?.()?.user;
  const [isMember, setIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !channelId) { setIsLoading(false); return; }
    supabase
      .from('channel_members')
      .select('user_id')
      .eq('channel_id', channelId)
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setIsMember(!!data);
        setIsLoading(false);
      });
  }, [channelId, user?.id]);

  const joinChannel = async () => {
    if (!user) return;
    await supabase.from('channel_members').insert({ channel_id: channelId, user_id: user.id, role: 'member' });
    setIsMember(true);
  };

  return { isMember, isLoading, joinChannel };
}
