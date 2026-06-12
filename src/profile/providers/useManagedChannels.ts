import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export interface ManagedChannel {
  id: string;
  name: string;
  avatarUrl?: string;
  memberCount: number;
  role: 'owner' | 'admin' | 'member';
}

export function useManagedChannels(userId?: string) {
  const currentUser = useAuthStore(s => s.user);
  const targetId = userId ?? currentUser?.id;

  const [channels, setChannels] = useState<ManagedChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!targetId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('channel_members')
        .select(`
          role,
          channels (
            id, name, avatar_url,
            channel_members(count)
          )
        `)
        .eq('user_id', targetId)
        .in('role', ['owner', 'admin', 'member']);

      if (err) throw err;

      const mapped: ManagedChannel[] = (data ?? []).flatMap((row: any) => {
        const ch = row.channels;
        if (!ch) return [];
        return [{
          id: ch.id,
          name: ch.name,
          avatarUrl: ch.avatar_url,
          memberCount: ch.channel_members?.[0]?.count ?? 0,
          role: row.role,
        }];
      });

      setChannels(mapped);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load channels');
    } finally {
      setIsLoading(false);
    }
  }, [targetId]);

  useEffect(() => { load(); }, [load]);

  return { channels, isLoading, error, refresh: load };
}
