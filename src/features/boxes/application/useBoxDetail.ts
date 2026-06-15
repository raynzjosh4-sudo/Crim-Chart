import { useState, useEffect } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { BoxModel } from '../components/BoxCard';
import { NativeDB } from '@/core/db/NativeDB';

export function useBoxDetail(id: string) {
  const [box, setBox] = useState<BoxModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const loadFromCache = async () => {
      try {
        const cached = await NativeDB.getBox(id);
        if (isMounted && cached) {
          setBox({
            id: cached.id,
            title: cached.title,
            description: cached.description || '',
            boxType: cached.box_type as any,
            coverImageUrl: cached.metadata?.coverImageUrl,
            itemCount: 0,
            owner_id: cached.owner_id,
            raw: cached,
          } as any);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[useBoxDetail] Error loading cache:', err);
      }
    };

    const fetchBox = async () => {
      // Don't set loading to true if we already have cache
      if (!box) setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('boxes')
          .select('id, title, description, box_type, metadata, owner_id, allow_submissions, is_public, age_restriction, country_restrictions, visible_to_followed_users')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (isMounted && data) {
          // Cache it locally
          await NativeDB.upsertBoxes([data]);

          setBox({
            id: data.id,
            title: data.title,
            description: data.description || '',
            boxType: data.box_type as any,
            coverImageUrl: data.metadata?.coverImageUrl,
            itemCount: 0,
            owner_id: data.owner_id,
            raw: data,
          } as any);
        }
      } catch (e: any) {
        console.error('[useBoxDetail] Error fetching box:', e);
        if (isMounted) setError(e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadFromCache().then(() => fetchBox());

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { box, isLoading, error };
}
