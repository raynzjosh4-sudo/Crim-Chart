-- Drop the function if it exists to allow for changes in return type
DROP FUNCTION IF EXISTS get_tagged_posts_v2(UUID[]);

-- Create the RPC to fetch and combine posts and channel_posts
CREATE OR REPLACE FUNCTION get_tagged_posts_v2(p_post_ids UUID[])
RETURNS TABLE (
  id UUID,
  author_id UUID,
  author_name TEXT,
  author_avatar TEXT,
  caption TEXT,
  image_urls JSONB,
  thumbnail_urls JSONB,
  video_url TEXT,
  audio_url TEXT,
  is_video BOOLEAN,
  is_audio BOOLEAN,
  type TEXT,
  likes_count INT,
  comments_count INT,
  views_count INT,
  downloads_count INT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.author_id,
    pr.display_name AS author_name,
    pr.profile_image_url AS author_avatar,
    p.caption,
    p.image_urls,
    p.thumbnail_urls,
    p.video_url,
    p.audio_url,
    p.is_video,
    p.is_audio,
    p.type,
    p.likes_count,
    p.comments_count,
    p.views_count,
    p.downloads_count,
    p.created_at
  FROM public.posts p
  LEFT JOIN public.profiles pr ON p.author_id = pr.id
  WHERE p.id = ANY(p_post_ids)
  
  UNION ALL
  
  SELECT 
    cp.id,
    cp.author_id,
    cpr.display_name AS author_name,
    cpr.profile_image_url AS author_avatar,
    cp.caption,
    cp.image_urls,
    cp.thumbnail_urls,
    cp.video_url,
    cp.audio_url,
    cp.is_video,
    cp.is_audio,
    cp.type,
    cp.likes_count,
    cp.comments_count,
    cp.views_count,
    cp.downloads_count,
    cp.created_at
  FROM public.channel_posts cp
  LEFT JOIN public.profiles cpr ON cp.author_id = cpr.id
  WHERE cp.id = ANY(p_post_ids);
END;
$$;
