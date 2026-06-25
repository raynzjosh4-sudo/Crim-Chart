import { supabase } from '@/core/supabase/supabaseConfig';
import { FeedStatusItem, feedStatusFromMap } from '../models/FeedStatusItem';

export const feedStatusesRemoteSource = {
  /**
   * Calls the Supabase RPC `fetch_followed_users_statuses`.
   * Returns active statuses for users that the current user follows.
   */
  async fetch(userId: string, limit = 50): Promise<FeedStatusItem[]> {
    const { data, error } = await supabase.rpc('fetch_followed_users_statuses', {
      p_user_id: userId,
      p_limit: limit,
    });

    if (error) {
      console.error('[FeedStatusesRemoteSource] RPC error:', error);
      return [];
    }

    return (data ?? []).map(feedStatusFromMap);
  },
};
