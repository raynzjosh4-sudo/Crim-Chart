-- Run this in Supabase SQL Editor
-- This RPC fetches the pointers and instantly joins them with the actual post/channel_post data,
-- returning a ready-to-use JSON array for the React Native frontend.
-- Updated with TikTok-style feed algorithm (Randomness + Engagement + Recency)

CREATE OR REPLACE FUNCTION public.get_short_video_feed_with_data(
    p_user_id uuid, 
    p_limit int DEFAULT 20, 
    p_offset int DEFAULT 0,
    p_seed float DEFAULT 0.0
)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    WITH all_videos AS (
        SELECT 
            id::text, 
            'post' as source_type, 
            created_at,
            COALESCE(likes_count, 0) as likes,
            COALESCE(comments_count, 0) as comments,
            COALESCE(views_count, 0) as views
        FROM public.posts
        WHERE is_video = true

        UNION ALL

        SELECT 
            id::text, 
            'channel_post' as source_type, 
            created_at,
            COALESCE(likes, 0) as likes,
            COALESCE(comments, 0) as comments,
            COALESCE(views_count, 0) as views
        FROM public.channel_posts
        WHERE is_video = true
    ),
    scored_videos AS (
        SELECT 
            id as entity_id, 
            source_type, 
            created_at,
            id as pointer_id,
            (
                -- 1. STABLE Random factor so pagination doesn't return duplicates
                -- Hashing the ID with the seed gives a stable 0-100 score for this specific session
                (mod(abs(hashtext(id::text || p_seed::text)), 1000) / 10.0)
                
                -- 2. Engagement Rate (up to infinity, but heavily weights interactions per view)
                + ((likes * 3.0 + comments * 5.0) * 100.0 / (views + 5.0))
                
                -- 3. Absolute Engagement (log scale to cap viral dominance)
                + (ln(likes + comments + 2.0) * 25.0)
                
                -- 4. Recency Boost (Decays linearly. Max 200 points for brand new)
                + GREATEST(200.0 - (EXTRACT(EPOCH FROM (now() - created_at))/3600.0 * 4.0), 0.0)
            ) as viral_score
        FROM all_videos
    ),
    pointers AS (
        SELECT 
            entity_id, 
            source_type, 
            created_at,
            pointer_id,
            viral_score
        FROM scored_videos
        ORDER BY viral_score DESC, created_at DESC
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
        ORDER BY p.created_at DESC -- Sort the final resulting 30 back into chronological order, or keep viral_score order?
        -- Actually, TikTok shows them completely mixed, so we should join and retain the viral_score order from pointers.
    )
    SELECT COALESCE(json_agg(row_to_json(sorted_feed_data)), '[]'::json) INTO result 
    FROM (
        SELECT f.* 
        FROM feed_data f
        JOIN pointers p ON f.pointer_id = p.pointer_id
        ORDER BY p.viral_score DESC, f.created_at DESC
    ) sorted_feed_data;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
