-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.get_user_profile_media(
  p_user_id uuid,
  p_media_type text,
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id text,
  author_id text,
  caption text,
  video_url text,
  audio_url text,
  image_urls jsonb,
  thumbnail_urls jsonb,
  is_video boolean,
  is_audio boolean,
  likes_count integer,
  comments_count integer,
  created_at timestamp with time zone,
  metadata jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT 
    id::TEXT,
    author_id::TEXT,
    COALESCE(caption, ''),
    video_url,
    audio_url,
    COALESCE(image_urls::JSONB, '[]'::JSONB),
    COALESCE(thumbnail_urls::JSONB, '[]'::JSONB),
    COALESCE(is_video, false),
    COALESCE(is_audio, false),
    COALESCE(likes_count, 0),
    COALESCE(comments_count, 0),
    created_at,
    COALESCE(metadata, '{}'::JSONB)
  FROM public.posts
  WHERE author_id = p_user_id
  AND (
    (p_media_type = 'video' AND is_video = true) OR
    (p_media_type = 'audio' AND is_audio = true) OR
    (p_media_type = 'photo' AND is_video = false AND is_audio = false AND (jsonb_array_length(COALESCE(image_urls::JSONB, '[]'::JSONB)) > 0))
  )
  ORDER BY created_at DESC
  LIMIT p_limit OFFSET p_offset;
$function$;
