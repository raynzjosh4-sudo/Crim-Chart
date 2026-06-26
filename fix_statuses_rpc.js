const { createClient } = require('@supabase/supabase-js');
const url = process.env.SUPABASE_URL || 'https://mrcynipmpismyneyhdwh.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(url, key);

const query = `
CREATE OR REPLACE FUNCTION fetch_followed_users_statuses(p_user_id UUID, p_limit INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  author_name TEXT,
  author_avatar_url TEXT,
  caption TEXT,
  image_urls JSONB,
  video_url TEXT,
  audio_url TEXT,
  is_video BOOLEAN,
  is_audio BOOLEAN,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.author_id,
    p.display_name AS author_name,
    p.profile_image_url AS author_avatar_url,
    s.caption,
    s.image_urls,
    s.video_url,
    s.audio_url,
    s.is_video,
    s.is_audio,
    s.thumbnail_url,
    s.created_at,
    s.expires_at
  FROM public.statuses s
  JOIN public.profiles p ON s.author_id = p.id
  WHERE (
    -- The user's own statuses
    s.author_id = p_user_id
    OR 
    -- Or users they follow
    s.author_id IN (
      SELECT following_id FROM public.follows WHERE follower_id = p_user_id
    )
  )
  AND (s.expires_at IS NULL OR s.expires_at > NOW())
  ORDER BY s.created_at DESC
  LIMIT p_limit;
END;
$$;
`;

async function run() {
  const { error } = await supabase.rpc('execute_sql', { query });
  console.log('Update RPC error:', error);
  if (!error) console.log('Successfully updated fetch_followed_users_statuses');
}

run();
