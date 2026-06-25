-- Function to fetch suggested users for a new profile to follow
DROP FUNCTION IF EXISTS get_suggested_users(uuid);

CREATE OR REPLACE FUNCTION get_suggested_users(
  p_current_user_id UUID
)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  profile_image_url TEXT,
  followers_count INT,
  country TEXT,
  birthday DATE,
  score INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_country TEXT;
  v_current_birthday TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the current user's country and birthday for scoring
  SELECT p.country, p.birthday
  INTO v_current_country, v_current_birthday
  FROM public.profiles p
  WHERE p.id = p_current_user_id;

  RETURN QUERY
  SELECT 
    p.id,
    p.display_name,
    p.profile_image_url,
    COALESCE(p.followers_count, 0) AS followers_count,
    p.country,
    p.birthday,
    (
      -- Scoring logic
      (CASE WHEN p.country = v_current_country AND p.country IS NOT NULL THEN 100 ELSE 0 END) +
      (CASE 
        WHEN v_current_birthday IS NOT NULL AND p.birthday IS NOT NULL THEN
          -- If age difference is within +/- 5 years, give a huge boost
          CASE WHEN ABS(EXTRACT(YEAR FROM age(p.birthday, v_current_birthday))) <= 5 THEN 50 ELSE 0 END
        ELSE 0 
      END) +
      -- Add a fraction of followers_count to rank popular users higher within the same matching tier
      LEAST(COALESCE(p.followers_count, 0), 1000)
    ) AS score
  FROM public.profiles p
  WHERE p.id != p_current_user_id
    -- Exclude users the current user is already following
    AND p.id NOT IN (
      SELECT f.following_id 
      FROM public.follows f 
      WHERE f.follower_id = p_current_user_id
    )
  ORDER BY score DESC, COALESCE(p.followers_count, 0) DESC
  LIMIT 20;
END;
$$;
