import { useState, useEffect } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';

export function useSuggestedUsers(currentUserId?: string) {
  const [users, setUsers] = useState<CrimChartUserModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    const fetchSuggestedUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_suggested_users', {
          p_current_user_id: currentUserId,
        });

        if (error) {
          console.error('Error fetching suggested users:', error);
          return;
        }

        if (data) {
          const mappedUsers = data.map((u: any) => ({
            id: u.id,
            username: u.display_name?.replace(/\s+/g, '').toLowerCase() || 'user',
            displayName: u.display_name || 'User',
            profileImageUrl: u.profile_image_url,
            crownTitle: u.crownTitle,
            followersCount: u.followers_count,
            // map other needed fields if necessary
          })) as CrimChartUserModel[];
          
          setUsers(mappedUsers);
        }
      } catch (err) {
        console.error('Failed to fetch suggested users', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, [currentUserId]);

  return { users, isLoading };
}
