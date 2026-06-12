-- Unified RPC function to fetch active channel moments with pagination
DROP FUNCTION IF EXISTS get_channel_moments(uuid, uuid, integer, integer);

CREATE OR REPLACE FUNCTION get_channel_moments(
  p_user_id UUID, 
  p_channel_id UUID DEFAULT NULL, 
  p_page_limit INT DEFAULT 10, 
  p_page_offset INT DEFAULT 0
)
RETURNS TABLE (
  channel_id UUID,
  channel_name TEXT,
  channel_avatar_url TEXT,
  latest_moment_time TIMESTAMPTZ,
  moments JSONB
) AS $$
BEGIN
  IF p_channel_id IS NULL THEN
    -- Global Feed: All channels the user follows that have active moments
    RETURN QUERY
    WITH active_moments AS (
      SELECT 
        cm.channel_id,
        jsonb_agg(
          jsonb_build_object(
            'id', cm.id,
            'media_url', cm.media_url,
            'thumbnail_url', cm.thumbnail_url,
            'caption', cm.caption,
            'media_type', cm.media_type,
            'created_at', cm.created_at,
            'author_id', cm.author_id
          ) ORDER BY cm.created_at ASC
        ) as moments_array,
        MAX(cm.created_at) as max_created_at
      FROM channel_moments cm
      JOIN channel_members mem ON mem.channel_id = cm.channel_id
      WHERE mem.user_id = p_user_id
        AND (cm.expires_at > NOW() OR (cm.expires_at IS NULL AND cm.created_at > NOW() - INTERVAL '24 hours'))
      GROUP BY cm.channel_id
    )
    SELECT 
      c.id, 
      c.name, 
      COALESCE(cb.cover_image_url, c.avatar_url) as channel_avatar_url,
      am.max_created_at as latest_moment_time,
      am.moments_array as moments
    FROM channels c
    JOIN active_moments am ON am.channel_id = c.id
    LEFT JOIN channel_branding cb ON cb.channel_id = c.id
    ORDER BY am.max_created_at DESC
    LIMIT p_page_limit OFFSET p_page_offset;

  ELSE
    -- Specific Channel Feed
    RETURN QUERY
    WITH active_moments AS (
      SELECT 
        cm.channel_id,
        jsonb_agg(
          jsonb_build_object(
            'id', cm.id,
            'media_url', cm.media_url,
            'thumbnail_url', cm.thumbnail_url,
            'caption', cm.caption,
            'media_type', cm.media_type,
            'created_at', cm.created_at,
            'author_id', cm.author_id
          ) ORDER BY cm.created_at ASC
        ) as moments_array,
        MAX(cm.created_at) as max_created_at
      FROM channel_moments cm
      WHERE cm.channel_id = p_channel_id
        AND (cm.expires_at > NOW() OR (cm.expires_at IS NULL AND cm.created_at > NOW() - INTERVAL '24 hours'))
      GROUP BY cm.channel_id
    )
    SELECT 
      c.id, 
      c.name, 
      COALESCE(cb.cover_image_url, c.avatar_url) as channel_avatar_url,
      am.max_created_at as latest_moment_time,
      am.moments_array as moments
    FROM channels c
    JOIN active_moments am ON am.channel_id = c.id
    LEFT JOIN channel_branding cb ON cb.channel_id = c.id
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql;
