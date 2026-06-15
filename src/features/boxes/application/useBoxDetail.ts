import { useState, useEffect } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { BoxModel } from '../components/BoxCard';

export function useBoxDetail(id: string) {
  const [box, setBox] = useState<BoxModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchBox = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('boxes')
          .select('id, title, description, box_type, metadata, owner_id, allow_submissions, is_public, age_restriction, country_restrictions, visible_to_followed_users')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (isMounted && data) {
          setBox({
            id: data.id,
            title: data.title,
            description: data.description || '', // We might need to extend BoxModel to include description, but for detail page we need it
            boxType: data.box_type as any,
            coverImageUrl: data.metadata?.coverImageUrl,
            itemCount: 0, // Placeholder until items are loaded
            owner_id: data.owner_id,
            // Let's attach the raw data for detail pages
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

    fetchBox();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { box, isLoading, error };
}
