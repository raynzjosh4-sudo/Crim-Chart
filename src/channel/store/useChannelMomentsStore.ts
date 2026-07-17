import { create } from 'zustand';
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

interface ChannelMomentsState {
  momentGroups: MomentGroup[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  offset: number;
  userId: string | null;
  
  setUserId: (userId: string) => void;
  fetchMoments: (reset?: boolean, channelId?: string) => Promise<void>;
}

const LIMIT = 10;

export const useChannelMomentsStore = create<ChannelMomentsState>((set, get) => ({
  momentGroups: [],
  loading: false,
  error: null,
  hasMore: true,
  offset: 0,
  userId: null,

  setUserId: (userId) => set({ userId }),

  fetchMoments: async (reset = false, channelId?: string) => {
    const { userId, loading, hasMore, offset, momentGroups } = get();
    if (!userId || loading || (!reset && !hasMore)) return;

    try {
      set({ loading: true, error: null });
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

        // Extract raw moments and save to local DB
        const allMoments = (data as MomentGroup[]).flatMap(group => group.moments);
        if (allMoments.length > 0) {
          const { channelLocalSource } = require('@/channel/data/sources/ChannelLocalSource');
          channelLocalSource.saveMoments(allMoments).catch(console.error);
        }

        set({
          momentGroups: newGroups,
          hasMore: data.length === LIMIT,
          offset: currentOffset + LIMIT,
          loading: false
        });
      } else {
        set({ hasMore: false, loading: false });
      }
    } catch (err: any) {
      console.error('Error fetching channel moments:', err);
      set({ error: err.message, loading: false });
    }
  }
}));
