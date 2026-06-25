-- Run this in Supabase SQL Editor
-- This RPC fetches the pointers and instantly joins them with the actual post/channel_post data,
-- returning a ready-to-use JSON array for the React Native frontend.

CREATE OR REPLACE FUNCTION public.get_short_video_feed_with_data(
    p_user_id uuid, 
    p_tab text, 
    p_limit int DEFAULT 20, 
    p_offset int DEFAULT 0
)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    WITH pointers AS (
        SELECT id as pointer_id, entity_id, source_type, created_at 
        FROM public.short_video_pointers
        WHERE 
            (p_tab = 'Explore' AND feed_context = 'explore' AND target_user_id IS NULL)
            OR (p_tab = 'Friends' AND feed_context = 'friends' AND target_user_id = p_user_id)
            OR (p_tab = 'Channel' AND feed_context = 'channel' AND target_user_id = p_user_id)
        ORDER BY created_at DESC
        LIMIT p_limit OFFSET p_offset
    ),
    feed_data AS (
        SELECT 
            p.pointer_id,
            p.entity_id as id,
            p.source_type,
            COALESCE(po.caption, cp.caption) as caption,
            COALESCE(po.video_url, cp.video_url) as video_url,
            COALESCE(po.is_video, cp.is_video) as is_video,
            COALESCE(po.likes_count, cp.likes, 0) as likes_count,
            COALESCE(po.comments_count, cp.comments, 0) as comments_count,
            COALESCE(po.tags_count, cp.tags_count, 0) as tags_count,
            p.created_at,
            json_build_object('id', pr.id, 'display_name', pr.display_name, 'profile_image_url', pr.profile_image_url) as profiles,
            CASE WHEN cp.channel_id IS NOT NULL THEN json_build_object('id', ch.id, 'name', ch.name) ELSE NULL END as channels
        FROM pointers p
        LEFT JOIN public.posts po ON p.source_type = 'post' AND p.entity_id = po.id::text
        LEFT JOIN public.channel_posts cp ON p.source_type = 'channel_post' AND p.entity_id = cp.id::text
        LEFT JOIN public.profiles pr ON pr.id = COALESCE(po.author_id, cp.author_id)
        LEFT JOIN public.channels ch ON ch.id = cp.channel_id
        ORDER BY p.created_at DESC
    )
    SELECT COALESCE(json_agg(row_to_json(feed_data)), '[]'::json) INTO result FROM feed_data;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
