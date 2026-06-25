CREATE OR REPLACE FUNCTION get_box_items_with_details(p_box_id UUID, p_limit INT DEFAULT 10, p_offset INT DEFAULT 0)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_agg(item) INTO v_result
  FROM (
    SELECT json_build_object(
      'id', bi.id,
      'box_id', bi.box_id,
      'post_id', bi.post_id,
      'likes_count', COALESCE(cp.likes_count, p.likes_count, 0),
      'dislikes_count', COALESCE(bi.dislikes_count, 0),
      'added_at', bi.added_at,
      'added_by', CASE WHEN pu.id IS NOT NULL THEN json_build_object(
        'id', bi.user_id,
        'name', pu.display_name,
        'avatarUrl', pu.profile_image_url
      ) ELSE NULL END,
      'post', json_build_object(
        'id', COALESCE(cp.id, p.id),
        'author_id', COALESCE(cp.author_id, p.author_id),
        'caption', COALESCE(cp.caption, p.caption),
        'video_url', COALESCE(cp.video_url, p.video_url),
        'image_urls', COALESCE(cp.image_urls, p.image_urls),
        'is_video', COALESCE(cp.is_video, p.is_video, false),
        'created_at', COALESCE(cp.created_at, p.created_at),
        'thumbnail_urls', COALESCE(cp.thumbnail_urls, p.thumbnail_urls),
        'audio_url', COALESCE(cp.audio_url, p.audio_url),
        'is_audio', COALESCE(cp.is_audio, p.is_audio, false),
        'aspect_ratio', COALESCE(cp.aspect_ratio, p.aspect_ratio),
        'allow_comments', COALESCE(cp.allow_comments, p.allow_comments),
        'video_urls', COALESCE(cp.video_urls, p.video_urls),
        'tags_count', COALESCE(cp.tags_count, p.tags_count),
        'metadata', COALESCE(cp.metadata, p.metadata),
        'views_count', COALESCE(cp.views_count, p.views_count),
        'downloads_count', COALESCE(cp.downloads_count, p.downloads_count),
        
        -- posts & channel_posts shared metrics mapped properly
        'comments_count', COALESCE(cp.comments, p.comments_count, 0),
        'likes_count', COALESCE(cp.likes, p.likes_count, 0),
        
        -- posts exclusive columns
        'tags', p.tags,
        'privacy', p.privacy,
        'role_viewer', p.role_viewer,
        'parent_post_id', p.parent_post_id,
        'time', p.time,
        'shares_count', p.shares_count,

        -- channel_posts exclusive columns
        'channel_id', cp.channel_id,
        'is_sponsored', cp.is_sponsored,
        'is_pending', cp.is_pending,
        'is_public', cp.is_public,
        'post_type', COALESCE(cp.post_type, cp.type, p.type),
        'channel_name', cp.channel_name,
        'channel_avatar_url', cp.channel_avatar_url,
        'widget_type', cp.widget_type,

        -- Aliases for frontend backward compatibility
        -- media_url: prefer first image, then video, then audio
        'media_url', COALESCE(
          (COALESCE(cp.image_urls, p.image_urls, '[]'::jsonb) ->> 0),
          cp.video_url, p.video_url,
          cp.audio_url, p.audio_url
        ),
        -- thumbnail_url: first element of thumbnail_urls array, fallback to first image
        'thumbnail_url', COALESCE(
          (COALESCE(cp.thumbnail_urls, p.thumbnail_urls, '[]'::jsonb) ->> 0),
          (COALESCE(cp.image_urls, p.image_urls, '[]'::jsonb) ->> 0),
          ''
        ),
        'author_name', pa.display_name,
        'author_avatar', pa.profile_image_url
      )
    ) as item
    FROM public.box_items bi
    LEFT JOIN public.channel_posts cp ON bi.post_id = cp.id
    LEFT JOIN public.posts p ON bi.post_id = p.id
    LEFT JOIN public.profiles pa ON pa.id = COALESCE(cp.author_id, p.author_id)
    LEFT JOIN public.profiles pu ON bi.user_id = pu.id
    WHERE bi.box_id = p_box_id
    ORDER BY bi.added_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) sub;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;
