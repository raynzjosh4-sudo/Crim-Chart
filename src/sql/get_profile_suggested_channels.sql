-- Function to fetch suggested channels based on another user's graph (e.g. when viewing someone's profile)
DROP FUNCTION IF EXISTS get_profile_suggested_channels(uuid, uuid, integer, integer);

CREATE OR REPLACE FUNCTION get_profile_suggested_channels(
  p_profile_user_id UUID, 
  p_current_user_id UUID,
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
  join_method TEXT,
  creator_name TEXT,
  creator_avatar_url TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE
  -- 1. Base case: The profile user's channels
  user_channels AS (
    SELECT cm.channel_id FROM channel_members cm WHERE cm.user_id = p_profile_user_id
  ),
  -- 2. Build the social tree up to depth 2
  channel_tree AS (
    SELECT 
      uc.channel_id,
      0 AS depth
    FROM user_channels uc
    
    UNION
    
    SELECT 
      cm2.channel_id,
      ct.depth + 1
    FROM channel_tree ct
    JOIN channel_members cm1 ON cm1.channel_id = ct.channel_id
    JOIN channel_members cm2 ON cm2.user_id = cm1.user_id
    WHERE ct.depth < 2
  ),
  -- 3. Extract candidate channels from the tree
  candidate_tree_channels AS (
    SELECT 
      ct.channel_id,
      MIN(ct.depth) as min_depth
    FROM channel_tree ct
    GROUP BY ct.channel_id
  ),
  -- 4. Combine tree channels with ALL other discoverable channels
  all_candidates AS (
    SELECT 
      c.id AS channel_id,
      COALESCE(ctc.min_depth, 99) AS depth
    FROM channels c
    LEFT JOIN candidate_tree_channels ctc ON ctc.channel_id = c.id
    WHERE c.creator_id != p_current_user_id -- Exclude channels created by the CURRENT user
      AND c.id NOT IN (SELECT uc_current.channel_id FROM channel_members uc_current WHERE uc_current.user_id = p_current_user_id) -- Exclude channels the CURRENT user has already joined
      AND c.is_discoverable = true
  )
  -- 5. Select the actual channel data, ordering by depth (closest to the profile user first), then size, then newest
  SELECT 
    c.id,
    c.creator_id,
    c.name,
    c.description,
    c.avatar_url,
    c.members_count,
    c.is_discoverable,
    c.join_method,
    u.display_name AS creator_name,
    u.profile_image_url AS creator_avatar_url
  FROM all_candidates ac
  JOIN channels c ON c.id = ac.channel_id
  LEFT JOIN profiles u ON u.id = c.creator_id
  ORDER BY ac.depth ASC, c.members_count DESC, c.created_at DESC, c.id ASC
  OFFSET p_page_offset
  LIMIT p_page_limit;
END;
$$;
