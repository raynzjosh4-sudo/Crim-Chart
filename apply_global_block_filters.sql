-- ==========================================
-- GLOBAL BI-DIRECTIONAL BLOCK FILTERING
-- ==========================================

-- 1. Create a STABLE helper function to get all mutually blocked UUIDs
CREATE OR REPLACE FUNCTION public.get_mutually_blocked_users(p_user_id UUID)
RETURNS UUID[] AS $$
  SELECT ARRAY(
    SELECT blocked_id FROM public.blocked_users WHERE blocker_id = p_user_id
    UNION
    SELECT blocker_id FROM public.blocked_users WHERE blocked_id = p_user_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- 2. Modify RLS Policies for Core Data Tables
-- Ensure these tables have RLS enabled (they should already)

-- POSTS
DROP POLICY IF EXISTS "Hide posts from blocked users" ON public.posts;
CREATE POLICY "Hide posts from blocked users" ON public.posts
FOR SELECT USING (
  author_id != ALL(public.get_mutually_blocked_users(auth.uid()))
);

-- CHANNEL POSTS
DROP POLICY IF EXISTS "Hide channel posts from blocked users" ON public.channel_posts;
CREATE POLICY "Hide channel posts from blocked users" ON public.channel_posts
FOR SELECT USING (
  author_id != ALL(public.get_mutually_blocked_users(auth.uid()))
);

-- STATUSES
DROP POLICY IF EXISTS "Hide statuses from blocked users" ON public.statuses;
CREATE POLICY "Hide statuses from blocked users" ON public.statuses
FOR SELECT USING (
  author_id != ALL(public.get_mutually_blocked_users(auth.uid()))
);

-- CHANNELS
DROP POLICY IF EXISTS "Hide channels from blocked users" ON public.channels;
CREATE POLICY "Hide channels from blocked users" ON public.channels
FOR SELECT USING (
  creator_id != ALL(public.get_mutually_blocked_users(auth.uid()))
);

-- BOXES
DROP POLICY IF EXISTS "Hide boxes from blocked users" ON public.boxes;
CREATE POLICY "Hide boxes from blocked users" ON public.boxes
FOR SELECT USING (
  owner_id != ALL(public.get_mutually_blocked_users(auth.uid()))
);

-- PROFILES (Hide profiles of blocked users from search/suggestions)
-- Note: You might want to omit this if you want blocked users to still be visible on the block list page itself!
-- But if the block list page uses a SECURITY DEFINER fetch or a view, it's fine.
DROP POLICY IF EXISTS "Hide profiles of blocked users" ON public.profiles;
CREATE POLICY "Hide profiles of blocked users" ON public.profiles
FOR SELECT USING (
  id != ALL(public.get_mutually_blocked_users(auth.uid()))
);


-- 3. Modify RPCs to drop SECURITY DEFINER 
-- Note: Some of these may need to be entirely recreated without SECURITY DEFINER,
-- but we can use ALTER FUNCTION to change their security context.
-- This ensures they run as the invoker and respect the RLS policies above.

DO $$ 
BEGIN
  -- We use a DO block to safely attempt ALTER FUNCTION if the function exists
  BEGIN
    ALTER FUNCTION public.fetch_followed_users_statuses(UUID, INT) SECURITY INVOKER;
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER FUNCTION public.get_mixed_feed(UUID, INT, INT) SECURITY INVOKER;
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER FUNCTION public.get_music_feed(INT, INT, TEXT) SECURITY INVOKER;
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER FUNCTION public.get_short_video_feed(UUID, INT, INT) SECURITY INVOKER;
  EXCEPTION WHEN OTHERS THEN END;

  BEGIN
    ALTER FUNCTION public.get_explore_channels(UUID, INT, INT) SECURITY INVOKER;
  EXCEPTION WHEN OTHERS THEN END;
  
  BEGIN
    ALTER FUNCTION public.search_everything(TEXT) SECURITY INVOKER;
  EXCEPTION WHEN OTHERS THEN END;
END $$;
