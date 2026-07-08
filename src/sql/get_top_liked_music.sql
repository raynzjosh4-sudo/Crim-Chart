-- ==============================================================
-- get_top_liked_music
-- ==============================================================
-- Fetches the most liked music tracks globally from three sources:
-- 1) posts
-- 2) channel_posts
-- 3) box_items (curated music inside boxes)
--
-- Ranked by likes_count DESC, created_at DESC.
-- Returns shape identical to get_music_feed:
-- (source_table TEXT, post_data JSONB, author JSONB)
-- ==============================================================

DROP FUNCTION IF EXISTS get_top_liked_music(INT, INT);
DROP FUNCTION IF EXISTS get_top_liked_music(INT, INT, TEXT);

CREATE OR REPLACE FUNCTION get_top_liked_music(
  p_limit    INT  DEFAULT 20,
  p_offset   INT  DEFAULT 0,
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  source_table  TEXT,
  post_data     JSONB,
  author        JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH combined_music AS (

    -- 1. Regular posts that have audio
    SELECT
      'posts'::TEXT                                AS source_table,
      to_jsonb(p)                                  AS post_data,
      p.author_id,
      p.created_at,
      COALESCE(p.likes_count, 0)                   AS likes_count
    FROM posts p
    WHERE p.audio_url IS NOT NULL AND p.audio_url != ''
      AND (p_category IS NULL OR p.category = p_category)

    UNION ALL

    -- 2. Channel posts that have audio
    SELECT
      'channel_posts'::TEXT                        AS source_table,
      to_jsonb(cp)                                 AS post_data,
      cp.author_id,
      cp.created_at,
      COALESCE(cp.likes, 0)                        AS likes_count
    FROM channel_posts cp
    WHERE cp.audio_url IS NOT NULL AND cp.audio_url != ''
      AND (p_category IS NULL OR cp.category = p_category)

    UNION ALL

    -- 3. Box Items that have audio (from either posts or channel_posts)
    SELECT
      'box_items'::TEXT                            AS source_table,
      -- we pick whichever post row matches
      CASE 
        WHEN cp.id IS NOT NULL THEN to_jsonb(cp)
        ELSE to_jsonb(p)
      END                                          AS post_data,
      COALESCE(cp.author_id, p.author_id)          AS author_id,
      bi.added_at                                  AS created_at,
      -- The box item's own curated likes count
      COALESCE(bi.likes_count, 0)                  AS likes_count
    FROM box_items bi
    LEFT JOIN channel_posts cp ON bi.post_id = cp.id
    LEFT JOIN posts p ON bi.post_id = p.id
    WHERE 
      ( (cp.id IS NOT NULL AND cp.audio_url IS NOT NULL AND cp.audio_url != '') OR
        (p.id IS NOT NULL AND p.audio_url IS NOT NULL AND p.audio_url != '') )
      AND (p_category IS NULL OR COALESCE(cp.category, p.category) = p_category)

  ),
  unique_music AS (
    SELECT DISTINCT ON (cm.post_data->>'id')
      cm.source_table,
      cm.post_data,
      cm.author_id,
      cm.likes_count,
      cm.created_at
    FROM combined_music cm
    ORDER BY cm.post_data->>'id', cm.likes_count DESC
  )
  SELECT
    um.source_table,
    um.post_data,
    jsonb_build_object(
      'id',                pr.id,
      'display_name',      pr.display_name,
      'profile_image_url', pr.profile_image_url,
      'crown_title',       pr.crown_title
    )                                              AS author
  FROM unique_music um
  LEFT JOIN profiles pr ON pr.id = um.author_id
  ORDER BY um.likes_count DESC, um.created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;

END;
$$;
