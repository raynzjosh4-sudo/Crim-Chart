import { useState, useEffect } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { useAuthStore } from './useAuthStore';

export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<CrimChartUserModel | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase.from('profiles').select('*, user_connection_stats(*)').eq('id', userId).single();
      // console.log('DEBUG useUserProfile data:', data, 'error:', error, 'userId:', userId);
      if (data) {
        setProfile(CrimChartUserModel.fromMap(data));
      }
    };

    fetchProfile();

    const channelName = `public:profiles:id=eq.${userId}-${Date.now()}-${Math.random()}`;
    const channel = supabase.channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, () => {
        fetchProfile();
      }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return profile;
}

export function useCurrentUserProfile() {
  const user = useAuthStore(state => state.user);
  return useUserProfile(user?.id);
}
