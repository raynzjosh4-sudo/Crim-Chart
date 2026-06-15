import { supabase } from '@/core/supabase/client';
import { useEffect, useState } from 'react';

export interface BoxMember {
  id: string;
  avatarUrl: string;
  name: string;
  interactionType: string;
  lastInteractionAt: string;
}

export const useBoxMembers = (boxId?: string) => {
  const [members, setMembers] = useState<BoxMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!boxId) {
      setIsLoading(false);
      return;
    }

    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        // Fetch box members and join with profiles to get avatar and name
        // Ordering by last_interaction_at descending as requested by user
        const { data, error } = await supabase
          .from('box_members')
          .select(`
            interaction_type,
            last_interaction_at,
            profiles:user_id (
              id,
              display_name,
              profile_image_url
            )
          `)
          .eq('box_id', boxId)
          .order('last_interaction_at', { ascending: false })
          .limit(20); // Limit to top 20 recent interactors for the widget

        if (error) {
          console.error('Error fetching box members:', error);
          return;
        }

        if (data) {
          const formattedMembers: BoxMember[] = data.map((item: any) => ({
            id: item.profiles.id,
            avatarUrl: item.profiles.profile_image_url || '',
            name: item.profiles.display_name || 'Unknown',
            interactionType: item.interaction_type,
            lastInteractionAt: item.last_interaction_at,
          }));
          
          setMembers(formattedMembers);
        }
      } catch (err) {
        console.error('Exception fetching box members:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [boxId]);

  return { members, isLoading };
};
