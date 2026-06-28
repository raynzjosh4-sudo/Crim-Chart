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
      AND cm.user_id != NEW.author_id; 

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
    ) AS targets;

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
    ) AS targets;

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
    created_at timestamp with time zone
) AS $$
DECLARE
    start_i int;
    end_i int;
    start_post_index int;
    end_post_index int;
    req_limit int;
    req_offset int;
BEGIN
    -- Math to determine how many actual posts we need from the DB 
    -- accounting for the synthetic carousels we inject every 10 posts.
    start_i := p_offset + 1;
    end_i := p_offset + p_limit;
    start_post_index := start_i - (start_i / 11);
    end_post_index := end_i - (end_i / 11);
    req_limit := end_post_index - start_post_index + 1;
    req_offset := start_post_index - 1;

    RETURN QUERY
    WITH deduplicated_pointers AS (
        SELECT DISTINCT ON (ufp.entity_id)
            ufp.id::text,
            ufp.entity_type,
            ufp.entity_id,
            ufp.source_type,
            ufp.created_at
        FROM public.user_feed_pointers ufp
        WHERE ufp.target_user_id = p_user_id
        ORDER BY ufp.entity_id, ufp.created_at DESC
    ),
    real_feed AS (
        SELECT 
            d.id, 
            d.entity_type, 
            d.entity_id, 
            d.source_type,
            d.created_at,
            (ROW_NUMBER() OVER (ORDER BY d.created_at DESC, d.id DESC)) as base_rn
        FROM deduplicated_pointers d
        ORDER BY d.created_at DESC, d.id DESC
        LIMIT req_limit OFFSET req_offset
    ),
    global_fallback AS (
        SELECT 
            'fallback_' || p.id AS id,
            CASE 
                WHEN p.is_video = true AND p.type ILIKE '%short%' THEN 'short_video_post'
                WHEN p.is_video = true THEN 'long_video_post'
                WHEN p.is_audio = true THEN 'audio_post'
                WHEN jsonb_array_length(COALESCE(p.image_urls, '[]'::jsonb)) > 0 THEN 'image_post'
                ELSE 'standard_post'
            END AS entity_type,
            p.id::text AS entity_id,
            'post'::text AS source_type,
            p.created_at,
            (ROW_NUMBER() OVER (ORDER BY p.created_at DESC, p.id DESC)) as base_rn
        FROM public.posts p
        WHERE NOT EXISTS (SELECT 1 FROM deduplicated_pointers LIMIT 1)
          AND p.privacy = 'public'
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT req_limit OFFSET req_offset
    ),
    base_feed AS (
        SELECT * FROM real_feed
        UNION ALL
        SELECT * FROM global_fallback WHERE NOT EXISTS (SELECT 1 FROM real_feed LIMIT 1)
    ),
    page_indices AS (
        SELECT i
        FROM generate_series(start_i, end_i) AS i
    ),
    final_combined AS (
        SELECT 
            i.i AS sort_rn,
            CASE 
                WHEN i.i % 11 = 0 AND (i.i / 11) % 2 = 1 THEN 'synthetic_channel_carousel_' || i.i
                WHEN i.i % 11 = 0 AND (i.i / 11) % 2 = 0 THEN 'synthetic_user_carousel_' || i.i
                ELSE b.id 
            END AS id,
            CASE 
                WHEN i.i % 11 = 0 AND (i.i / 11) % 2 = 1 THEN 'channel_recommendation_carousel'
                WHEN i.i % 11 = 0 AND (i.i / 11) % 2 = 0 THEN 'user_recommendation_carousel'
                ELSE b.entity_type 
            END AS entity_type,
            CASE 
                WHEN i.i % 11 = 0 AND (i.i / 11) % 2 = 1 THEN 'carousel_channel_' || i.i
                WHEN i.i % 11 = 0 AND (i.i / 11) % 2 = 0 THEN 'carousel_user_' || i.i
                ELSE b.entity_id 
            END AS entity_id,
            CASE 
                WHEN i.i % 11 = 0 THEN 'carousel'::text
                ELSE b.source_type 
            END AS source_type,
            CASE 
                WHEN i.i % 11 = 0 THEN now()
                ELSE b.created_at 
            END AS created_at
        FROM page_indices i
        LEFT JOIN base_feed b 
            ON b.base_rn = i.i - (i.i / 11)
        WHERE b.id IS NOT NULL 
           OR (i.i % 11 = 0 AND EXISTS (
                  SELECT 1 FROM base_feed 
                  WHERE base_rn >= i.i - (i.i / 11) - 1
              ))
    )
    SELECT fc.id, fc.entity_type, fc.entity_id, fc.source_type, fc.created_at
    FROM final_combined fc
    ORDER BY fc.sort_rn ASC;
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
