-- Backfill script for short_video_pointers
-- Run this in the Supabase SQL Editor to populate the table with existing videos

-- 1. Clear existing pointers just in case you run this multiple times
TRUNCATE TABLE public.short_video_pointers;

-- 2. Global Posts (Explore)
-- Adds all global video posts to the main Explore feed
INSERT INTO public.short_video_pointers (entity_id, source_type, feed_context, target_user_id, created_at)
SELECT id::text, 'post', 'explore', NULL, created_at
FROM public.posts
WHERE is_video = true;

-- 3. Global Posts (Friends)
-- For every global video post, insert a pointer for every user who follows the author
INSERT INTO public.short_video_pointers (entity_id, source_type, feed_context, target_user_id, created_at)
SELECT p.id::text, 'post', 'friends', f.follower_id, p.created_at
FROM public.posts p
JOIN public.follows f ON p.author_id = f.following_id
WHERE p.is_video = true;

-- 4. Channel Posts (Explore)
-- Adds channel video posts to the Explore feed so non-members can discover them
INSERT INTO public.short_video_pointers (entity_id, source_type, feed_context, target_user_id, created_at)
SELECT id::text, 'channel_post', 'explore', NULL, created_at
FROM public.channel_posts
WHERE is_video = true;

-- 5. Channel Posts (Channel / Members)
-- For every channel video post, insert a pointer for every member of that channel
INSERT INTO public.short_video_pointers (entity_id, source_type, feed_context, target_user_id, created_at)
SELECT cp.id::text, 'channel_post', 'channel', cm.user_id, cp.created_at
FROM public.channel_posts cp
JOIN public.channel_members cm ON cp.channel_id = cm.channel_id
WHERE cp.is_video = true;

-- Verify the backfill worked
SELECT feed_context, count(*) as count 
FROM public.short_video_pointers 
GROUP BY feed_context;
