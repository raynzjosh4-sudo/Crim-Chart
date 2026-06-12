import { useState, useEffect } from 'react';
import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export function useChannelAdmin(channelId: string) {
  const user = (useAuthStore as any).getState?.()?.user;
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !channelId) { setIsLoading(false); return; }
    supabase
      .from('channel_members')
      .select('role')
      .eq('channel_id', channelId)
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.role === 'admin' || data?.role === 'owner');
        setIsLoading(false);
      });
  }, [channelId, user?.id]);

  return { isAdmin, isLoading };
}
