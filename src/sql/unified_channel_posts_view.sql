-- Drop the view if it exists so we can recreate it cleanly
DROP VIEW IF EXISTS public.unified_channel_posts_view;

CREATE OR REPLACE VIEW public.unified_channel_posts_view AS

-- 1. Native Channel Posts
SELECT 
  cp.id,
  cp.channel_id,
  cp.author_id,
  cp.caption,
  cp.image_urls,
  cp.video_url,
  cp.is_video,
  cp.likes,
  cp.comments,
  cp.tags_count,
  cp.created_at,
  cp.type,
  'channel_posts' as source_table,
  cp.audio_url,
  cp.is_audio,
  cp.thumbnail_urls,
  cp.video_urls,
  cp.aspect_ratio,
  cp.metadata,
  -- We pre-build the author object so the frontend gets it identically to the foreign-key join syntax
  jsonb_build_object(
    'id', pr.id, 
    'display_name', pr.display_name, 
    'profile_image_url', pr.profile_image_url
  ) as author
FROM public.channel_posts cp
LEFT JOIN public.profiles pr ON pr.id = cp.author_id
WHERE cp.type != 'status' OR cp.type IS NULL

UNION 

-- 2. Tagged Global Posts
SELECT
  p.id,
  cct.target_channel_id as channel_id,
  p.author_id,
  p.caption,
  p.image_urls,
  p.video_url,
  p.is_video,
  p.likes_count as likes,
  p.comments_count as comments,
  p.tags_count,
  p.created_at,
  p.type,
  'posts' as source_table,
  p.audio_url,
  p.is_audio,
  p.thumbnail_urls,
  p.video_urls,
  p.aspect_ratio,
  p.metadata,
  jsonb_build_object(
    'id', pr.id, 
    'display_name', pr.display_name, 
    'profile_image_url', pr.profile_image_url
  ) as author
FROM public.posts p
JOIN public.channel_content_tags cct ON cct.post_id = p.id
LEFT JOIN public.profiles pr ON pr.id = p.author_id
WHERE p.type != 'status' OR p.type IS NULL

UNION

-- 3. Tagged Channel Posts (posts from other channels tagged into this one)
SELECT
  cp.id,
  cct.target_channel_id as channel_id,
  cp.author_id,
  cp.caption,
  cp.image_urls,
  cp.video_url,
  cp.is_video,
  cp.likes,
  cp.comments,
  cp.tags_count,
  cp.created_at,
  cp.type,
  'channel_posts' as source_table,
  cp.audio_url,
  cp.is_audio,
  cp.thumbnail_urls,
  cp.video_urls,
  cp.aspect_ratio,
  cp.metadata,
  jsonb_build_object(
    'id', pr.id, 
    'display_name', pr.display_name, 
    'profile_image_url', pr.profile_image_url
  ) as author
FROM public.channel_posts cp
JOIN public.channel_content_tags cct ON cct.post_id = cp.id
LEFT JOIN public.profiles pr ON pr.id = cp.author_id
WHERE cp.type != 'status' OR cp.type IS NULL;

-- 4. Grant access to the API roles
GRANT SELECT ON public.unified_channel_posts_view TO anon, authenticated;

-- 5. Force Supabase PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
