-- ==========================================
-- RECALCULATE ALL PROFILE STATS
-- ==========================================
-- Run this script ONCE in your Supabase SQL Editor to retroactively 
-- count all existing data and update every user's profile stats.

UPDATE public.profiles p
SET 
  -- 1. Count Channels created by the user
  channels_created_count = (
    SELECT COUNT(*) 
    FROM public.channels c 
    WHERE c.creator_id = p.id
  ),
  
  -- 2. Count Posts created by the user
  posts_count = (
    SELECT COUNT(*) 
    FROM public.posts po 
    WHERE po.author_id = p.id
  ),
  
  -- 3. Count Followers (people following this user)
  followers_count = (
    SELECT COUNT(*) 
    FROM public.follows f 
    WHERE f.following_id = p.id
  ),
  
  -- 4. Count Following (people this user follows)
  following_count = (
    SELECT COUNT(*) 
    FROM public.follows f 
    WHERE f.follower_id = p.id
  ),
  
  -- 5. Count Inboxes (threads where the user is user_id)
  inbox_count = (
    SELECT COUNT(*) 
    FROM public.inbox i 
    WHERE i.user_id = p.id
  ),
  
  -- 6. Count Boxes created by the user
  boxes_count = (
    SELECT COUNT(*) 
    FROM public.boxes b 
    WHERE b.owner_id = p.id
  ),
  
  -- 7. Count Box Submissions (items in their boxes added by someone else)
  -- We determine this by checking if the post's author is different from the box owner
  box_submissions_count = (
    SELECT COUNT(*) 
    FROM public.box_items bi 
    JOIN public.boxes bx ON bi.box_id = bx.id 
    JOIN public.channel_posts cp ON bi.post_id = cp.id
    WHERE bx.owner_id = p.id AND cp.author_id != p.id
  );

-- Note: Depending on the size of your database, this might take a few seconds to run.
-- It will safely overwrite the existing counts with the 100% accurate historical totals.
