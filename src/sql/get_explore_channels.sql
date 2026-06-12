-- Function to fetch explore channels using a social graph tree (recursive CTE)
DROP FUNCTION IF EXISTS get_explore_channels(uuid, integer, integer);

CREATE OR REPLACE FUNCTION get_explore_channels(
  p_user_id UUID, 
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
  -- 1. Get the channels the user is currently in (Depth 0)
  user_channels AS (
    SELECT cm.channel_id
    FROM channel_members cm
    WHERE cm.user_id = p_user_id
  ),
  -- 2. Traverse the graph: User -> Channels -> Co-Members -> Their Channels
  channel_tree AS (
    -- Base case: Channels the user is directly in
    SELECT 
      uc.channel_id,
      0 as depth
    FROM user_channels uc

    UNION
    
    -- Recursive step: Find users in the current channels, then find the channels those users are in.
    -- We limit depth to 2 to prevent massive query times.
    SELECT 
      cm2.channel_id,
      ct.depth + 1
    FROM channel_tree ct
    JOIN channel_members cm1 ON cm1.channel_id = ct.channel_id
    JOIN channel_members cm2 ON cm2.user_id = cm1.user_id
    WHERE ct.depth < 2
  ),
  -- 3. Extract candidate channels from the tree, assigning minimum depth
  candidate_tree_channels AS (
    SELECT 
      ct.channel_id,
      MIN(ct.depth) as min_depth
    FROM channel_tree ct
    WHERE ct.depth > 0 -- depth 0 is the user's own channels, which we exclude
    GROUP BY ct.channel_id
  ),
  -- 4. Combine tree channels with ALL other discoverable channels in the DB
  -- Tree channels get their computed depth (1 or 2). Other channels get depth 99.
  all_candidates AS (
    SELECT 
      c.id AS channel_id,
      COALESCE(ctc.min_depth, 99) AS depth
    FROM channels c
    LEFT JOIN candidate_tree_channels ctc ON ctc.channel_id = c.id
    WHERE c.creator_id != p_user_id -- Exclude owned
      AND c.id NOT IN (SELECT uc.channel_id FROM user_channels uc) -- Exclude joined
      AND c.is_discoverable = true
  )
  -- 5. Select the actual channel data, ordering by depth (closest first), then size, then newest
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
