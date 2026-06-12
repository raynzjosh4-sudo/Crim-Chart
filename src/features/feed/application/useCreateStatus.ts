import { useState } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

interface CreateStatusParams {
  caption?: string;
  imageUrls?: string[];
  videoUrl?: string;
  audioUrl?: string;
  isVideo?: boolean;
  isAudio?: boolean;
  privacy?: string;
  allowComments?: boolean;
  thumbnailUrl?: string;
  expiresAt?: Date;
}

export const useCreateStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createStatus = async (params: CreateStatusParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('You must be logged in to create a status.');

      const { error: insertError } = await supabase.from('statuses').insert({
        author_id: user.id,
        caption: params.caption || null,
        image_urls: params.imageUrls || [],
        video_url: params.videoUrl || null,
        audio_url: params.audioUrl || null,
        is_video: params.isVideo || false,
        is_audio: params.isAudio || false,
        privacy: params.privacy || 'public',
        allow_comments: params.allowComments ?? true,
        thumbnail_url: params.thumbnailUrl || null,
        expires_at: params.expiresAt ? params.expiresAt.toISOString() : null,
      });

      if (insertError) throw insertError;

      return true;
    } catch (e) {
      console.error('Failed to create status:', e);
      setError(e instanceof Error ? e : new Error('Unknown error occurred'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createStatus,
    isLoading,
    error,
  };
};
