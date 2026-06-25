import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';

export interface ChannelMoment {
  id: string;
  media_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  media_type: string;
  created_at: string;
  author_id: string;
}

export interface MomentGroup {
  channel_id: string;
  channel_name: string;
  channel_avatar_url: string;
  latest_moment_time: string;
  moments: ChannelMoment[];
}

export const useChannelMoments = (userId: string, channelId?: string) => {
  const [momentGroups, setMomentGroups] = useState<MomentGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 10;

  const fetchMoments = useCallback(async (reset = false) => {
    if (!userId || loading || (!reset && !hasMore)) return;

    try {
      setLoading(true);
      const currentOffset = reset ? 0 : offset;
      
      const { data, error: rpcError } = await supabase.rpc('get_channel_moments', {
        p_user_id: userId,
        p_channel_id: channelId || null,
        p_page_limit: LIMIT,
        p_page_offset: currentOffset,
      });

      if (rpcError) throw rpcError;

      if (data) {
        let newGroups: MomentGroup[] = [];
        if (reset) {
          newGroups = data as MomentGroup[];
        } else {
          newGroups = [...momentGroups, ...(data as MomentGroup[])];
        }
        setMomentGroups(newGroups);

        // Extract raw moments and save to local DB
        const allMoments = (data as MomentGroup[]).flatMap(group => group.moments);
        if (allMoments.length > 0) {
          const { channelLocalSource } = require('@/channel/data/sources/ChannelLocalSource');
          channelLocalSource.saveMoments(allMoments).catch(console.error);
        }
        setHasMore(data.length === LIMIT);
        setOffset(currentOffset + LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error('Error fetching channel moments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, channelId, offset, loading, hasMore, momentGroups]);

  useEffect(() => {
    fetchMoments(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, channelId]);

  return { momentGroups, fetchMoments, loading, error, hasMore };
};
