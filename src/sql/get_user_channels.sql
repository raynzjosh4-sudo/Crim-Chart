-- Unified RPC function to get owned, joined, or similar channels
DROP FUNCTION IF EXISTS get_user_channels(uuid, uuid, text, integer, integer);

CREATE OR REPLACE FUNCTION get_user_channels(
  p_user_id UUID, 
  p_target_user_id UUID, 
  p_filter_type TEXT,    
  p_page_offset INT DEFAULT 0, 
  p_page_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  creator_id UUID,
  name TEXT,
  description TEXT,
  avatar_url TEXT,
  members_count INT,
  is_discoverable BOOLEAN,
  created_at TIMESTAMPTZ,
  creator_name TEXT,
  creator_avatar_url TEXT,
  channel_type TEXT,
  unread_count INT,
  moments_count INT,
  messages_count INT,
  tags_count INT,
  likes_count INT,
  followers_count INT,
  has_active_members BOOLEAN
) AS $$
-- Subexpression for live active moments count (not expired)
BEGIN
  IF p_filter_type = 'owned' THEN
    RETURN QUERY
    SELECT 
      c.id, c.creator_id, c.name, c.description, c.avatar_url, c.members_count, c.is_discoverable, c.created_at,
      p.display_name as creator_name, p.profile_image_url as creator_avatar_url,
      'owned'::TEXT as channel_type,
      COALESCE(cm.unread_count, 0) as unread_count,
      -- Live count of only non-expired moments instead of stale cached column
      CAST((SELECT COUNT(*) FROM channel_moments cmo
            WHERE cmo.channel_id = c.id
            AND (cmo.expires_at > NOW() OR (cmo.expires_at IS NULL AND cmo.created_at > NOW() - INTERVAL '24 hours'))
           ) AS INT) as moments_count,
      c.messages_count, c.tags_count, c.likes_count, c.followers_count, c.has_active_members
    FROM channels c
    LEFT JOIN profiles p ON p.id = c.creator_id
    LEFT JOIN channel_members cm ON cm.channel_id = c.id AND cm.user_id = p_user_id
    WHERE c.creator_id = p_user_id
    ORDER BY c.created_at DESC
    LIMIT p_page_limit OFFSET p_page_offset;

  ELSIF p_filter_type = 'joined' THEN
    RETURN QUERY
    SELECT 
      c.id, c.creator_id, c.name, c.description, c.avatar_url, c.members_count, c.is_discoverable, c.created_at,
      p.display_name as creator_name, p.profile_image_url as creator_avatar_url,
      'joined'::TEXT as channel_type,
      COALESCE(cm.unread_count, 0) as unread_count,
      -- Live count of only non-expired moments instead of stale cached column
      CAST((SELECT COUNT(*) FROM channel_moments cmo
            WHERE cmo.channel_id = c.id
            AND (cmo.expires_at > NOW() OR (cmo.expires_at IS NULL AND cmo.created_at > NOW() - INTERVAL '24 hours'))
           ) AS INT) as moments_count,
      c.messages_count, c.tags_count, c.likes_count, c.followers_count, c.has_active_members
    FROM channels c
    JOIN channel_members cm ON cm.channel_id = c.id
    LEFT JOIN profiles p ON p.id = c.creator_id
    WHERE cm.user_id = p_user_id
    ORDER BY cm.joined_at DESC
    LIMIT p_page_limit OFFSET p_page_offset;

  ELSIF p_filter_type = 'similar' THEN
    RETURN QUERY
    SELECT 
      c.id, c.creator_id, c.name, c.description, c.avatar_url, c.members_count, c.is_discoverable, c.created_at,
      p.display_name as creator_name, p.profile_image_url as creator_avatar_url,
      'similar'::TEXT as channel_type,
      0 as unread_count,
      -- Live count of only non-expired moments instead of stale cached column
      CAST((SELECT COUNT(*) FROM channel_moments cmo
            WHERE cmo.channel_id = c.id
            AND (cmo.expires_at > NOW() OR (cmo.expires_at IS NULL AND cmo.created_at > NOW() - INTERVAL '24 hours'))
           ) AS INT) as moments_count,
      c.messages_count, c.tags_count, c.likes_count, c.followers_count, c.has_active_members
    FROM channels c
    JOIN channel_members cm1 ON cm1.channel_id = c.id
    JOIN channel_members cm2 ON cm2.channel_id = c.id
    LEFT JOIN profiles p ON p.id = c.creator_id
    WHERE cm1.user_id = p_user_id AND cm2.user_id = p_target_user_id
    ORDER BY c.members_count DESC
    LIMIT p_page_limit OFFSET p_page_offset;
  END IF;
END;
$$ LANGUAGE plpgsql;
