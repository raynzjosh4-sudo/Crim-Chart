import { supabase } from '@/core/supabase/client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { NativeDB } from '@/core/db/NativeDB';

export interface BoxMember {
  id: string;
  avatarUrl: string;
  name: string;
  interactionType: string;
  lastInteractionAt: string;
}

const PAGE_SIZE = 20;

export const useBoxMembers = (boxId?: string) => {
  const [members, setMembers] = useState<BoxMember[]>([]);
  const membersRef = useRef<BoxMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  useEffect(() => {
    if (!boxId) return;

    let isMounted = true;
    const loadFromCache = async () => {
      try {
        const cached = await NativeDB.getBoxMembers(boxId);
        if (isMounted && cached && cached.length > 0) {
          setMembers(cached);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[useBoxMembers] Error loading cache:', err);
      }
    };

    loadFromCache();
    // Fetch network in the other effect
  }, [boxId]);

  const fetchMembers = useCallback(async (pageIndex: number, isInitial = false) => {
    if (!boxId) return;
    
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsPaginating(true);
    }

    try {
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

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
        .range(from, to);

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
        
        if (isInitial) {
          await NativeDB.saveBoxMembers(boxId, formattedMembers);
          setMembers(formattedMembers);
        } else {
          setMembers([...membersRef.current, ...formattedMembers]);
        }

        setHasMore(data.length === PAGE_SIZE);
      } else {
        if (isInitial) {
          await NativeDB.saveBoxMembers(boxId, []);
          setMembers([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error('Exception fetching box members:', err);
    } finally {
      setIsLoading(false);
      setIsPaginating(false);
    }
  }, [boxId]);

  useEffect(() => {
    if (boxId) {
      setPage(0);
      setHasMore(true);
      fetchMembers(0, true);
    } else {
      setIsLoading(false);
      setMembers([]);
    }
  }, [boxId, fetchMembers]);

  const loadMore = useCallback(() => {
    if (!isLoading && !isPaginating && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMembers(nextPage, false);
    }
  }, [isLoading, isPaginating, hasMore, page, fetchMembers]);

  return { members, isLoading, isPaginating, hasMore, loadMore };
};
