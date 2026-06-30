-- Execute this script in your Supabase SQL Editor
-- This function fetches audio posts from both the `posts` and `channel_posts` tables and paginates them.

DROP FUNCTION IF EXISTS get_music_feed(INT, INT);

CREATE OR REPLACE FUNCTION get_music_feed(p_limit INT, p_offset INT)
RETURNS TABLE (
    source_table TEXT,
    post_data JSONB,
    author JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH combined_music AS (
        -- Music from regular posts
        SELECT 
            'posts'::TEXT as source_table,
            to_jsonb(p) as post_data,
            p.author_id,
            p.created_at
        FROM posts p
        WHERE p.audio_url IS NOT NULL AND p.audio_url != ''
        
        UNION ALL
        
        -- Music from channel posts
        SELECT 
            'channel_posts'::TEXT as source_table,
            to_jsonb(cp) as post_data,
            cp.author_id,
            cp.created_at
        FROM channel_posts cp
        WHERE cp.audio_url IS NOT NULL AND cp.audio_url != ''
    )
    SELECT 
        cm.source_table,
        cm.post_data,
        jsonb_build_object(
            'id', pr.id,
            'display_name', pr.display_name,
            'profile_image_url', pr.profile_image_url,
            'crown_title', pr.crown_title
        ) as author
    FROM combined_music cm
    LEFT JOIN profiles pr ON pr.id = cm.author_id
    ORDER BY cm.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;
