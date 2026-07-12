-- ==========================================
-- SCALABLE SHORT VIDEO FEED POINTERS (VIDS TAB)
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create the Pointers Table
CREATE TABLE IF NOT EXISTS public.short_video_pointers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  target_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL means Global Explore
  entity_id text NOT NULL, -- ID of the post or channel_post
  source_type text NOT NULL, -- 'post' or 'channel_post'
  feed_context text NOT NULL, -- 'explore', 'friends', or 'channel'
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT short_video_pointers_pkey PRIMARY KEY (id)
);

-- 2. Indexes for instant loading
-- For Friends and Channel tabs (filtered by user)
CREATE INDEX IF NOT EXISTS idx_short_vid_pointers_user 
ON public.short_video_pointers(target_user_id, feed_context, created_at DESC);

-- For Explore tab (Global mix, where target_user_id IS NULL)
CREATE INDEX IF NOT EXISTS idx_short_vid_pointers_explore 
ON public.short_video_pointers(feed_context, created_at DESC) 
WHERE target_user_id IS NULL;

-- For fast cleanup
CREATE INDEX IF NOT EXISTS idx_short_vid_pointers_entity 
ON public.short_video_pointers(entity_id);

-- 3. Enable RLS
ALTER TABLE public.short_video_pointers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View own or explore short video pointers" ON public.short_video_pointers;
CREATE POLICY "View own or explore short video pointers" 
ON public.short_video_pointers FOR SELECT 
USING (target_user_id = auth.uid() OR target_user_id IS NULL);


-- ==========================================
-- 4. CHANNEL POSTS SHORT VIDEO DISTRIBUTION
-- ==========================================
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
        ON CONFLICT (target_user_id, entity_id, feed_context) DO NOTHING;
    END IF;

    -- Channel Tab: Write for all channel members (including author for testing/verification)
    INSERT INTO public.short_video_pointers (target_user_id, entity_id, source_type, feed_context, created_at)
    SELECT 
        cm.user_id, 
        NEW.id::text, 
        'channel_post',
        'channel',
        NEW.created_at
    FROM public.channel_members cm
    WHERE cm.channel_id = NEW.channel_id
    ON CONFLICT (target_user_id, entity_id, feed_context) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_short_video_channel_post_created ON public.channel_posts;
CREATE TRIGGER on_short_video_channel_post_created
AFTER INSERT ON public.channel_posts
FOR EACH ROW
EXECUTE FUNCTION public.distribute_short_video_channel_post();


-- ==========================================
-- 5. REGULAR POSTS SHORT VIDEO DISTRIBUTION
-- ==========================================
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
        ON CONFLICT (target_user_id, entity_id, feed_context) DO NOTHING;
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
        ON CONFLICT (target_user_id, entity_id, feed_context) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_short_video_regular_post_created ON public.posts;
CREATE TRIGGER on_short_video_regular_post_created
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.distribute_short_video_regular_post();


-- ==========================================
-- 6. CLEANUP GHOST POINTERS ON DELETION
-- ==========================================
CREATE OR REPLACE FUNCTION public.cleanup_deleted_short_video_pointers()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.short_video_pointers WHERE entity_id = OLD.id::text;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_short_video_channel_post_deleted ON public.channel_posts;
CREATE TRIGGER on_short_video_channel_post_deleted
AFTER DELETE ON public.channel_posts
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_deleted_short_video_pointers();

DROP TRIGGER IF EXISTS on_short_video_regular_post_deleted ON public.posts;
CREATE TRIGGER on_short_video_regular_post_deleted
AFTER DELETE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_deleted_short_video_pointers();


-- ==========================================
-- 7. SCALABLE FAST RPC FOR FRONTEND
-- ==========================================
DROP FUNCTION IF EXISTS public.get_short_video_feed(uuid, text, int, int);

CREATE OR REPLACE FUNCTION public.get_short_video_feed(
    p_user_id uuid, 
    p_tab text, 
    p_limit int DEFAULT 20, 
    p_offset int DEFAULT 0
)
RETURNS TABLE (
    id text,
    entity_id text,
    source_type text,
    created_at timestamp with time zone
) AS $$
BEGIN
    IF p_tab = 'explore' THEN
        RETURN QUERY 
        SELECT p.id::text, p.entity_id, p.source_type, p.created_at 
        FROM public.short_video_pointers p
        WHERE p.feed_context = 'explore' AND p.target_user_id IS NULL
        ORDER BY p.created_at DESC
        LIMIT p_limit OFFSET p_offset;
        
    ELSIF p_tab = 'friends' THEN
        RETURN QUERY 
        SELECT p.id::text, p.entity_id, p.source_type, p.created_at 
        FROM public.short_video_pointers p
        WHERE p.feed_context = 'friends' AND p.target_user_id = p_user_id
        ORDER BY p.created_at DESC
        LIMIT p_limit OFFSET p_offset;
        
    ELSIF p_tab = 'channel' THEN
        RETURN QUERY 
        SELECT p.id::text, p.entity_id, p.source_type, p.created_at 
        FROM public.short_video_pointers p
        WHERE p.feed_context = 'channel' AND p.target_user_id = p_user_id
        ORDER BY p.created_at DESC
        LIMIT p_limit OFFSET p_offset;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
