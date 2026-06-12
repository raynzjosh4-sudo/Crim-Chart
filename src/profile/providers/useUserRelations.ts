import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export interface UserRelations {
  followers: string[]; // user IDs
  following: string[];
  followersCount: number;
  followingCount: number;
  isFollowing: (userId: string) => boolean;
}

export function useUserRelations(targetUserId?: string) {
  const currentUser = useAuthStore(s => s.user);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!targetUserId) return;
    setIsLoading(true);
    try {
      const [{ data: followerRows }, { data: followingRows }] = await Promise.all([
        supabase.from('follows').select('follower_id').eq('following_id', targetUserId),
        supabase.from('follows').select('following_id').eq('follower_id', targetUserId),
      ]);
      setFollowers((followerRows ?? []).map((r: any) => r.follower_id));
      setFollowing((followingRows ?? []).map((r: any) => r.following_id));
    } catch (e) {
      console.error('[useUserRelations]', e);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => { load(); }, [load]);

  const isFollowing = (userId: string) =>
    currentUser != null && following.includes(userId);

  return {
    followers,
    following,
    followersCount: followers.length,
    followingCount: following.length,
    isFollowing,
    isLoading,
    refresh: load,
  };
}
