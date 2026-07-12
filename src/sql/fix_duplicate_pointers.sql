-- ============================================================
-- MIGRATION: Fix duplicate feed pointers
-- Run this ENTIRE script in the Supabase SQL Editor
-- 
-- IMPORTANT: Order matters here.
--   1. TRUNCATE first (removes duplicates that block the constraint)
--   2. Add unique constraints (now safe since table is empty)
--   3. Recreate all trigger functions with ON CONFLICT DO NOTHING
-- ============================================================


-- ============================================================
-- STEP 1: Flush all stale / duplicate data FIRST
-- (Must happen before ADD CONSTRAINT — duplicates block it)
-- ============================================================
TRUNCATE public.user_feed_pointers;
TRUNCATE public.short_video_pointers;


-- ============================================================
-- STEP 2: Add unique constraints (safe now that tables are empty)
-- ============================================================

-- user_feed_pointers: one pointer per (user, entity, entity_type)
ALTER TABLE public.user_feed_pointers
  DROP CONSTRAINT IF EXISTS unique_user_feed_pointer;
ALTER TABLE public.user_feed_pointers
  ADD CONSTRAINT unique_user_feed_pointer
  UNIQUE (target_user_id, entity_id, entity_type);

-- short_video_pointers: one row per (user, entity, feed_context)
ALTER TABLE public.short_video_pointers
  DROP CONSTRAINT IF EXISTS unique_short_video_pointer;
ALTER TABLE public.short_video_pointers
  ADD CONSTRAINT unique_short_video_pointer
  UNIQUE (target_user_id, entity_id, feed_context);


-- ============================================================
-- STEP 3: Recreate distribute_channel_post with ON CONFLICT
-- ============================================================
CREATE OR REPLACE FUNCTION public.distribute_channel_post()
RETURNS TRIGGER AS $$
DECLARE
    v_channel_join_method text;
BEGIN
    -- Skip store items entirely
    IF NEW.type = 'store_item' OR NEW.post_type = 'store_item' THEN
        RETURN NEW;
    END IF;

    -- Skip private channel posts (not meant for any feed)
    IF NEW.is_public = false THEN
        RETURN NEW;
    END IF;

    -- Skip posts from private/invite-only channels
    SELECT join_method INTO v_channel_join_method
    FROM public.channels
    WHERE id = NEW.channel_id;

    IF v_channel_join_method IN ('invite', 'request') THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.user_feed_pointers (target_user_id, entity_type, entity_id, source_type, created_at)
    SELECT 
        cm.user_id, 
        CASE 
            WHEN NEW.is_video = true AND NEW.post_type ILIKE '%short%' THEN 'short_video_post'
            WHEN NEW.is_video = true THEN 'long_video_post'
            WHEN NEW.is_audio = true THEN 'audio_post'
            WHEN jsonb_array_length(COALESCE(NEW.image_urls, '[]'::jsonb)) > 0 THEN 'image_post'
            ELSE 'standard_post'
        END AS calculated_entity_type,
        NEW.id::text, 
        'channel_post',
        NEW.created_at
    FROM public.channel_members cm
    WHERE cm.channel_id = NEW.channel_id
      AND cm.user_id != NEW.author_id
    ON CONFLICT (target_user_id, entity_id, entity_type) DO NOTHING; -- ✅ FIX

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_channel_post_created ON public.channel_posts;
CREATE TRIGGER on_channel_post_created
AFTER INSERT ON public.channel_posts
FOR EACH ROW
EXECUTE FUNCTION public.distribute_channel_post();


-- ============================================================
-- STEP 4: Recreate distribute_regular_post with ON CONFLICT
-- ============================================================
CREATE OR REPLACE FUNCTION public.distribute_regular_post()
RETURNS TRIGGER AS $$
BEGIN
    -- Ignore store items
    IF NEW.type = 'store_item' THEN
        RETURN NEW;
    END IF;

    -- Skip non-public posts
    IF NEW.privacy IS NOT NULL AND NEW.privacy != 'public' THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.user_feed_pointers (target_user_id, entity_type, entity_id, source_type, created_at)
    SELECT 
        targets.target_id, 
        CASE 
            WHEN NEW.is_video = true AND NEW.type ILIKE '%short%' THEN 'short_video_post'
            WHEN NEW.is_video = true THEN 'long_video_post'
            WHEN NEW.is_audio = true THEN 'audio_post'
            WHEN jsonb_array_length(COALESCE(NEW.image_urls, '[]'::jsonb)) > 0 THEN 'image_post'
            ELSE 'standard_post'
        END AS calculated_entity_type,
        NEW.id::text, 
        'post',
        NEW.created_at
    FROM (
        -- GROUP 1: Direct Followers
        SELECT follower_id AS target_id FROM public.follows WHERE following_id = NEW.author_id
        UNION
        -- GROUP 2: The Author themselves
        SELECT NEW.author_id AS target_id
    ) AS targets
    ON CONFLICT (target_user_id, entity_id, entity_type) DO NOTHING; -- ✅ FIX

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_regular_post_created ON public.posts;
CREATE TRIGGER on_regular_post_created
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.distribute_regular_post();


-- ============================================================
-- STEP 5: Recreate distribute_box with ON CONFLICT
-- ============================================================
CREATE OR REPLACE FUNCTION public.distribute_box()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_feed_pointers (target_user_id, entity_type, entity_id, source_type, created_at)
    SELECT 
        targets.target_id, 
        'box_' || NEW.box_type,
        NEW.id::text, 
        'box',
        NEW.created_at
    FROM (
        -- GROUP 1: Direct Followers
        SELECT follower_id AS target_id FROM public.follows WHERE following_id = NEW.owner_id
        UNION
        -- GROUP 2: The Owner themselves
        SELECT NEW.owner_id AS target_id
    ) AS targets
    ON CONFLICT (target_user_id, entity_id, entity_type) DO NOTHING; -- ✅ FIX

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_box_created ON public.boxes;
CREATE TRIGGER on_box_created
AFTER INSERT ON public.boxes
FOR EACH ROW
EXECUTE FUNCTION public.distribute_box();


-- ============================================================
-- STEP 6: Recreate distribute_short_video_channel_post with ON CONFLICT
-- ============================================================
CREATE OR REPLACE FUNCTION public.distribute_short_video_channel_post()
RETURNS TRIGGER AS $$
DECLARE
    v_channel_join_method text;
BEGIN
    -- Check if it is a short video. If not, do nothing.
    IF NOT (NEW.is_video = true AND NEW.post_type ILIKE '%short%') THEN
        RETURN NEW;
    END IF;

    -- Skip private channel posts entirely
    IF NEW.is_public = false THEN
        RETURN NEW;
    END IF;

    -- Check channel settings for Explore eligibility
    SELECT join_method INTO v_channel_join_method
    FROM public.channels
    WHERE id = NEW.channel_id;

    -- Explore Mix: Only write if the channel is completely public ('anyone')
    IF v_channel_join_method = 'anyone' THEN
        INSERT INTO public.short_video_pointers (target_user_id, entity_id, source_type, feed_context, created_at)
        VALUES (NULL, NEW.id::text, 'channel_post', 'explore', NEW.created_at)
        ON CONFLICT (target_user_id, entity_id, feed_context) DO NOTHING; -- ✅ FIX
    END IF;

    -- Channel Tab: Write for all channel members
    INSERT INTO public.short_video_pointers (target_user_id, entity_id, source_type, feed_context, created_at)
    SELECT 
        cm.user_id, 
        NEW.id::text, 
        'channel_post',
        'channel',
        NEW.created_at
    FROM public.channel_members cm
    WHERE cm.channel_id = NEW.channel_id
    ON CONFLICT (target_user_id, entity_id, feed_context) DO NOTHING; -- ✅ FIX

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_short_video_channel_post_created ON public.channel_posts;
CREATE TRIGGER on_short_video_channel_post_created
AFTER INSERT ON public.channel_posts
FOR EACH ROW
EXECUTE FUNCTION public.distribute_short_video_channel_post();


-- ============================================================
-- STEP 7: Recreate distribute_short_video_regular_post with ON CONFLICT
-- ============================================================
CREATE OR REPLACE FUNCTION public.distribute_short_video_regular_post()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if it is a short video. If not, do nothing.
    IF NOT (NEW.is_video = true AND NEW.type ILIKE '%short%') THEN
        RETURN NEW;
    END IF;

    -- Explore Mix: Only write if the post is explicitly public
    IF NEW.privacy = 'public' THEN
        INSERT INTO public.short_video_pointers (target_user_id, entity_id, source_type, feed_context, created_at)
        VALUES (NULL, NEW.id::text, 'post', 'explore', NEW.created_at)
        ON CONFLICT (target_user_id, entity_id, feed_context) DO NOTHING; -- ✅ FIX
    END IF;

    -- Friends Tab: Write to all direct followers AND the author themselves
    IF NEW.privacy IN ('public', 'followers') THEN
        INSERT INTO public.short_video_pointers (target_user_id, entity_id, source_type, feed_context, created_at)
        SELECT target_id, NEW.id::text, 'post', 'friends', NEW.created_at
        FROM (
            SELECT follower_id AS target_id FROM public.follows WHERE following_id = NEW.author_id
            UNION
            SELECT NEW.author_id AS target_id
        ) targets
        ON CONFLICT (target_user_id, entity_id, feed_context) DO NOTHING; -- ✅ FIX
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_short_video_regular_post_created ON public.posts;
CREATE TRIGGER on_short_video_regular_post_created
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.distribute_short_video_regular_post();


-- ============================================================
-- Done! Duplicates are now structurally impossible.
-- ============================================================
