-- ==============================================================
-- search_music_feed
-- ==============================================================
-- Searches music across both `posts` and `channel_posts` tables.
-- Uses full-text search (tsvector/tsquery) with prefix matching,
-- the same approach as `search_everything`.
--
-- Searched fields:
--   posts:         caption, category, metadata->>'title', metadata->>'artist',
--                  metadata->>'album', metadata->>'lyrics'
--   channel_posts: caption, category, metadata->>'title', metadata->>'artist',
--                  metadata->>'album', metadata->>'lyrics', channel_name
--
-- Returns: (source_table, post_data, author) — identical to get_music_feed()
-- so the existing useMusicFeed hook can consume it with zero changes.
-- ==============================================================

DROP FUNCTION IF EXISTS search_music_feed(TEXT, INT, INT);
DROP FUNCTION IF EXISTS search_music_feed(TEXT, INT, INT, TEXT);

CREATE OR REPLACE FUNCTION search_music_feed(
  p_search_query  TEXT,
  p_limit         INT  DEFAULT 20,
  p_offset        INT  DEFAULT 0,
  p_category      TEXT DEFAULT NULL
)
RETURNS TABLE (
  source_table  TEXT,
  post_data     JSONB,
  author        JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- Build a prefix-matching tsquery from the search term.
  -- e.g. "bohemian rhap" -> 'bohemian:* & rhap:*'
  v_formatted  TEXT    := replace(trim(p_search_query), ' ', ':* & ') || ':*';
  v_query      TSQUERY := to_tsquery('simple', v_formatted);
BEGIN
  -- Guard: return nothing for blank queries
  IF trim(p_search_query) = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH combined_music AS (

    -- 1. Regular posts that have audio
    SELECT
      'posts'::TEXT                                                   AS source_table,
      to_jsonb(p)                                                     AS post_data,
      p.author_id,
      p.created_at,
      ts_rank(
        to_tsvector('simple',
          coalesce(p.caption,                      '') || ' ' ||
          coalesce(p.category,                     '') || ' ' ||
          coalesce(p.metadata->>'title',           '') || ' ' ||
          coalesce(p.metadata->>'artist',          '') || ' ' ||
          coalesce(p.metadata->>'album',           '') || ' ' ||
          coalesce(p.metadata->>'lyrics',          '')
        ),
        v_query
      )                                                               AS rank
    FROM posts p
    WHERE
      -- must have audio
      p.audio_url IS NOT NULL AND p.audio_url != ''
      -- full-text match
      AND to_tsvector('simple',
            coalesce(p.caption,             '') || ' ' ||
            coalesce(p.category,            '') || ' ' ||
            coalesce(p.metadata->>'title',  '') || ' ' ||
            coalesce(p.metadata->>'artist', '') || ' ' ||
            coalesce(p.metadata->>'album',  '') || ' ' ||
            coalesce(p.metadata->>'lyrics', '')
          ) @@ v_query
      -- optional category filter
      AND (p_category IS NULL OR p.category = p_category)

    UNION ALL

    -- 2. Channel posts that have audio
    SELECT
      'channel_posts'::TEXT                                           AS source_table,
      to_jsonb(cp)                                                    AS post_data,
      cp.author_id,
      cp.created_at,
      ts_rank(
        to_tsvector('simple',
          coalesce(cp.caption,                       '') || ' ' ||
          coalesce(cp.category,                      '') || ' ' ||
          coalesce(cp.metadata->>'title',            '') || ' ' ||
          coalesce(cp.metadata->>'artist',           '') || ' ' ||
          coalesce(cp.metadata->>'album',            '') || ' ' ||
          coalesce(cp.metadata->>'lyrics',           '') || ' ' ||
          coalesce(cp.channel_name,                  '')
        ),
        v_query
      )                                                               AS rank
    FROM channel_posts cp
    WHERE
      cp.audio_url IS NOT NULL AND cp.audio_url != ''
      AND to_tsvector('simple',
            coalesce(cp.caption,              '') || ' ' ||
            coalesce(cp.category,             '') || ' ' ||
            coalesce(cp.metadata->>'title',   '') || ' ' ||
            coalesce(cp.metadata->>'artist',  '') || ' ' ||
            coalesce(cp.metadata->>'album',   '') || ' ' ||
            coalesce(cp.metadata->>'lyrics',  '') || ' ' ||
            coalesce(cp.channel_name,         '')
          ) @@ v_query
      AND (p_category IS NULL OR cp.category = p_category)

  ),
  unique_music AS (
    SELECT DISTINCT ON (cm.post_data->>'id')
      cm.source_table,
      cm.post_data,
      cm.author_id,
      cm.rank,
      cm.created_at
    FROM combined_music cm
    ORDER BY cm.post_data->>'id', cm.rank DESC
  )
  SELECT
    um.source_table,
    um.post_data,
    jsonb_build_object(
      'id',                pr.id,
      'display_name',      pr.display_name,
      'profile_image_url', pr.profile_image_url,
      'crown_title',       pr.crown_title
    )                                                                 AS author
  FROM unique_music um
  LEFT JOIN profiles pr ON pr.id = um.author_id
  -- Best matches first; break ties by newest
  ORDER BY um.rank DESC, um.created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;

END;
$$;


-- ==============================================================
-- GIN indexes for fast full-text search on music fields
-- (safe to re-run - uses IF NOT EXISTS)
-- ==============================================================

-- posts: covers all music-specific metadata fields
-- Partial index: only indexes rows that actually have audio (smaller, faster)
CREATE INDEX IF NOT EXISTS idx_posts_music_search
ON posts
USING GIN (
  to_tsvector('simple',
    coalesce(caption,             '') || ' ' ||
    coalesce(category,            '') || ' ' ||
    coalesce(metadata->>'title',  '') || ' ' ||
    coalesce(metadata->>'artist', '') || ' ' ||
    coalesce(metadata->>'album',  '') || ' ' ||
    coalesce(metadata->>'lyrics', '')
  )
)
WHERE audio_url IS NOT NULL AND audio_url != '';

-- channel_posts: includes channel_name as an extra search signal
CREATE INDEX IF NOT EXISTS idx_channel_posts_music_search
ON channel_posts
USING GIN (
  to_tsvector('simple',
    coalesce(caption,             '') || ' ' ||
    coalesce(category,            '') || ' ' ||
    coalesce(metadata->>'title',  '') || ' ' ||
    coalesce(metadata->>'artist', '') || ' ' ||
    coalesce(metadata->>'album',  '') || ' ' ||
    coalesce(metadata->>'lyrics', '') || ' ' ||
    coalesce(channel_name,        '')
  )
)
WHERE audio_url IS NOT NULL AND audio_url != '';
