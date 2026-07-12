-- ==========================================
-- FAN-OUT ARCHITECTURE: USER FEED POINTERS
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create the Pointers Table
CREATE TABLE IF NOT EXISTS public.user_feed_pointers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  target_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  source_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_feed_pointers_pkey PRIMARY KEY (id)
);

-- Index for instant timeline loading
CREATE INDEX IF NOT EXISTS idx_feed_pointers_target_time ON public.user_feed_pointers(target_user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.user_feed_pointers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own feed pointers" ON public.user_feed_pointers;
CREATE POLICY "Users can view their own feed pointers" ON public.user_feed_pointers FOR SELECT USING (auth.uid() = target_user_id);


-- ==========================================
-- 2. CHANNEL POSTS DISTRIBUTION
-- ==========================================
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

    -- Skip posts from private/invite-only channels (non-members can't view)
    -- Also skip if channel has age or country restrictions (content stays inside channel)
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
            -- channel_posts uses post_type (e.g. 'short_video_item', 'youtube_video', 'post')
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
    ON CONFLICT (target_user_id, entity_id, entity_type) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_channel_post_created ON public.channel_posts;
CREATE TRIGGER on_channel_post_created
AFTER INSERT ON public.channel_posts
FOR EACH ROW
EXECUTE FUNCTION public.distribute_channel_post();


-- ==========================================
-- 3. REGULAR POSTS DISTRIBUTION
-- ==========================================
CREATE OR REPLACE FUNCTION public.distribute_regular_post()
RETURNS TRIGGER AS $$
BEGIN
    -- Ignore store items
    IF NEW.type = 'store_item' THEN
        RETURN NEW;
    END IF;

    -- Skip non-public posts (privacy = 'private')
    IF NEW.privacy IS NOT NULL AND NEW.privacy != 'public' THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.user_feed_pointers (target_user_id, entity_type, entity_id, source_type, created_at)
    SELECT 
        targets.target_id, 
        CASE 
            -- Explicit short type wins first
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
    ON CONFLICT (target_user_id, entity_id, entity_type) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_regular_post_created ON public.posts;
CREATE TRIGGER on_regular_post_created
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.distribute_regular_post();


-- ==========================================
-- 4. BOXES DISTRIBUTION
-- ==========================================
CREATE OR REPLACE FUNCTION public.distribute_box()
RETURNS TRIGGER AS $$
BEGIN
    -- Fan-out to the extended graph network
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
    ON CONFLICT (target_user_id, entity_id, entity_type) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_box_created ON public.boxes;
CREATE TRIGGER on_box_created
AFTER INSERT ON public.boxes
FOR EACH ROW
EXECUTE FUNCTION public.distribute_box();


-- ==========================================
-- 5. SMART FEED RPC WITH RANDOMIZED INJECTIONS
-- ==========================================
DROP FUNCTION IF EXISTS public.get_mixed_feed(uuid, int, int);

CREATE OR REPLACE FUNCTION public.get_mixed_feed(p_user_id uuid, p_limit int, p_offset int)
RETURNS TABLE (
    id text,
    entity_type text,
    entity_id text,
    source_type text,
    created_at timestamptz
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        distinct_feed.c_id, 
        distinct_feed.c_entity_type, 
        distinct_feed.c_entity_id, 
        distinct_feed.c_source_type, 
        distinct_feed.c_created_at 
    FROM (
        SELECT DISTINCT ON (combined_feed.c_entity_id)
            combined_feed.c_id::text,
            combined_feed.c_entity_type,
            combined_feed.c_entity_id,
            combined_feed.c_source_type,
            combined_feed.c_created_at
        FROM (
            -- Source 1: Followed content pointers
            SELECT 
                ufp.id::text AS c_id, 
                ufp.entity_type AS c_entity_type, 
                ufp.entity_id AS c_entity_id, 
                ufp.source_type AS c_source_type, 
                ufp.created_at AS c_created_at
            FROM public.user_feed_pointers ufp
            WHERE ufp.target_user_id = p_user_id
            
            UNION ALL
            
            -- Source 2: Fallback (only if needed)
            SELECT 
                ('fallback_' || p.id)::text AS c_id, 
                CASE 
                    WHEN p.is_video = true AND p.type ILIKE '%short%' THEN 'short_video_post'
                    WHEN p.is_video = true THEN 'long_video_post'
                    WHEN p.is_audio = true THEN 'audio_post'
                    WHEN jsonb_array_length(COALESCE(p.image_urls, '[]'::jsonb)) > 0 THEN 'image_post'
                    ELSE 'standard_post'
                END AS c_entity_type,
                p.id::text AS c_entity_id, 
                'post'::text AS c_source_type, 
                p.created_at AS c_created_at
            FROM public.posts p
            WHERE NOT EXISTS (SELECT 1 FROM public.user_feed_pointers ufp2 WHERE ufp2.target_user_id = p_user_id)
            AND p.privacy = 'public'
        ) AS combined_feed
    ) AS distinct_feed
    ORDER BY distinct_feed.c_created_at DESC, distinct_feed.c_entity_id DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 8. CLEANUP DELETED POSTS (GHOST POINTERS)
-- ==========================================
CREATE OR REPLACE FUNCTION public.cleanup_deleted_feed_pointers()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.user_feed_pointers WHERE entity_id = OLD.id::text;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_channel_post_deleted ON public.channel_posts;
CREATE TRIGGER on_channel_post_deleted
AFTER DELETE ON public.channel_posts
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_deleted_feed_pointers();

DROP TRIGGER IF EXISTS on_regular_post_deleted ON public.posts;
CREATE TRIGGER on_regular_post_deleted
AFTER DELETE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_deleted_feed_pointers();
