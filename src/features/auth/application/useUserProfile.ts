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
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setProfile({
          id: data.id,
          displayName: data.username,
          profileImageUrl: data.profile_image_url,
          createdAt: new Date(data.created_at),
          // map other fields
        } as CrimChartUserModel);
      }
    };

    fetchProfile();

    const channel = supabase.channel(`public:profiles:id=eq.${userId}`)
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
