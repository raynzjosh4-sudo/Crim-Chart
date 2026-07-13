-- 1. Create the Return Type
DROP TYPE IF EXISTS global_search_result CASCADE;
CREATE TYPE global_search_result AS (
  entity_id uuid,
  entity_type text,
  title text,
  subtitle text,
  image_url text,
  rank real
);

-- 2. Build the Lean GIN Indexes
-- Profiles (Name, Bio, Crown Title)
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles 
USING GIN (to_tsvector('simple', coalesce(display_name, '') || ' ' || coalesce(bio, '') || ' ' || coalesce(crown_title, '')));

-- Channels (Name, Description, Category)
CREATE INDEX IF NOT EXISTS idx_channels_search ON channels 
USING GIN (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '')));

-- Posts (Caption, Category, plus deep JSON for Music: Artist, Album, Lyrics)
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts 
USING GIN (to_tsvector('simple', coalesce(caption, '') || ' ' || coalesce(category, '') || ' ' || coalesce(metadata->>'artist', '') || ' ' || coalesce(metadata->>'album', '') || ' ' || coalesce(metadata->>'lyrics', '')));

-- Channel Posts
CREATE INDEX IF NOT EXISTS idx_channel_posts_search ON channel_posts 
USING GIN (to_tsvector('simple', coalesce(caption, '') || ' ' || coalesce(category, '')));

-- Boxes (Title, Description, Box Type)
CREATE INDEX IF NOT EXISTS idx_boxes_search ON boxes 
USING GIN (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(box_type, '')));

-- Crowns (Title, Description)
CREATE INDEX IF NOT EXISTS idx_crowns_search ON crowns 
USING GIN (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')));

-- 3. The Unified Search Function
CREATE OR REPLACE FUNCTION search_everything(search_term text)
RETURNS SETOF global_search_result AS $$
DECLARE
  formatted_query text := replace(trim(search_term), ' ', ':* & ') || ':*';
  search_query tsquery := to_tsquery('simple', formatted_query);
BEGIN
  IF trim(search_term) = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  
  -- 1. PROFILES
  SELECT id AS entity_id, 'profile' AS entity_type, display_name AS title, bio AS subtitle, profile_image_url AS image_url,
    ts_rank(to_tsvector('simple', coalesce(display_name, '') || ' ' || coalesce(bio, '') || ' ' || coalesce(crown_title, '')), search_query) AS rank
  FROM profiles WHERE to_tsvector('simple', coalesce(display_name, '') || ' ' || coalesce(bio, '') || ' ' || coalesce(crown_title, '')) @@ search_query

  UNION ALL

  -- 2. CHANNELS
  SELECT id AS entity_id, 'channel' AS entity_type, name AS title, description AS subtitle, avatar_url AS image_url,
    ts_rank(to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '')), search_query) AS rank
  FROM channels WHERE to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '')) @@ search_query AND is_discoverable = true

  UNION ALL

  -- 3. GLOBAL POSTS (Splitting Music, Video, and Standard)
  SELECT id AS entity_id,
    CASE WHEN is_audio THEN 'music' WHEN is_video THEN 'video' ELSE 'post' END AS entity_type,
    CASE 
      WHEN is_audio THEN coalesce(metadata->>'title', caption, 'Unknown')
      ELSE coalesce(metadata->>'artist', caption, 'Unknown') 
    END AS title,
    CASE 
      WHEN is_audio THEN coalesce(metadata->>'artist', category, '')
      ELSE coalesce(caption, category, '') 
    END AS subtitle,
    coalesce(nullif(replace(replace(replace(image_urls::text, '[', ''), ']', ''), '"', ''), ''), (thumbnail_urls->>0)::text) AS image_url,
    ts_rank(to_tsvector('simple', coalesce(caption, '') || ' ' || coalesce(category, '') || ' ' || coalesce(metadata->>'artist', '') || ' ' || coalesce(metadata->>'album', '') || ' ' || coalesce(metadata->>'lyrics', '')), search_query) AS rank
  FROM posts WHERE to_tsvector('simple', coalesce(caption, '') || ' ' || coalesce(category, '') || ' ' || coalesce(metadata->>'artist', '') || ' ' || coalesce(metadata->>'album', '') || ' ' || coalesce(metadata->>'lyrics', '')) @@ search_query

  UNION ALL

  -- 4. CHANNEL POSTS
  SELECT cp.id AS entity_id,
    CASE WHEN cp.is_audio THEN 'channel_music' WHEN cp.is_video THEN 'channel_video' ELSE 'channel_post' END AS entity_type,
    CASE 
      WHEN cp.is_audio THEN coalesce(cp.metadata->>'title', cp.caption, 'Unknown')
      ELSE cp.caption 
    END AS title, 
    CASE 
      WHEN cp.is_audio THEN coalesce(cp.metadata->>'artist', cp.channel_name, '')
      ELSE cp.channel_name 
    END AS subtitle, 
    coalesce(nullif(replace(replace(replace(cp.image_urls::text, '[', ''), ']', ''), '"', ''), ''), (cp.thumbnail_urls->>0)::text) AS image_url,
    ts_rank(to_tsvector('simple', coalesce(cp.caption, '') || ' ' || coalesce(cp.category, '')), search_query) AS rank
  FROM channel_posts cp
  JOIN channels c ON c.id = cp.channel_id
  WHERE to_tsvector('simple', coalesce(cp.caption, '') || ' ' || coalesce(cp.category, '')) @@ search_query
    AND c.is_discoverable = true
    AND c.join_method IN ('open', 'anyone')

  UNION ALL

  -- 5. BOXES (Shallow search for speed, explicitly mapping box subtypes)
  SELECT id AS entity_id, 
    CASE box_type
      WHEN 'audio' THEN 'box_music'
      WHEN 'video' THEN 'box_movie'
      WHEN 'marketplace' THEN 'box_store'
      WHEN 'sports' THEN 'box_sports'
      WHEN 'contest' THEN 'box_voting'
      ELSE 'box_' || box_type
    END AS entity_type, 
    title, description AS subtitle, NULL AS image_url,
    ts_rank(to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(box_type, '')), search_query) AS rank
  FROM boxes WHERE to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(box_type, '')) @@ search_query

  UNION ALL

  -- 6. CROWNS
  SELECT id AS entity_id, 'crown' AS entity_type, title, description AS subtitle, NULL AS image_url,
    ts_rank(to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')), search_query) AS rank
  FROM crowns WHERE to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')) @@ search_query

  -- Final Sort and Hard Limit to protect server memory
  ORDER BY rank DESC
  LIMIT 50;

END;
$$ LANGUAGE plpgsql;
