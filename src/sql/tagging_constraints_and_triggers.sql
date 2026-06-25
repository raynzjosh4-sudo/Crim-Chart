-- 0. Drop the foreign key constraint that restricts tagging to ONLY channel_posts
-- This allows you to tag global posts (from public.posts) into channels!
ALTER TABLE public.channel_content_tags
DROP CONSTRAINT IF EXISTS channel_content_tags_post_id_fkey;

-- 1. Add Unique Constraint to prevent duplicate tagging
-- This ensures a user can only tag a specific post into a specific target channel once.
ALTER TABLE public.channel_content_tags
DROP CONSTRAINT IF EXISTS unique_post_user_target_channel;

ALTER TABLE public.channel_content_tags
ADD CONSTRAINT unique_post_user_target_channel 
UNIQUE (post_id, user_id, target_channel_id);

-- 2. Create Trigger Function to increment/decrement post and channel tag counts
CREATE OR REPLACE FUNCTION update_post_and_channel_tags_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment tags_count on the post (if it's a channel post)
    UPDATE public.channel_posts
    SET tags_count = COALESCE(tags_count, 0) + 1
    WHERE id = NEW.post_id;
    
    -- Increment tags_count on the post (if it's a global post)
    UPDATE public.posts
    SET tags_count = COALESCE(tags_count, 0) + 1
    WHERE id = NEW.post_id;
    
    -- Increment tags_count on the target channel
    UPDATE public.channels
    SET tags_count = COALESCE(tags_count, 0) + 1
    WHERE id = NEW.target_channel_id;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement tags_count on the post (if it's a channel post)
    UPDATE public.channel_posts
    SET tags_count = GREATEST(COALESCE(tags_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    
    -- Decrement tags_count on the post (if it's a global post)
    UPDATE public.posts
    SET tags_count = GREATEST(COALESCE(tags_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    
    -- Decrement tags_count on the target channel
    UPDATE public.channels
    SET tags_count = GREATEST(COALESCE(tags_count, 0) - 1, 0)
    WHERE id = OLD.target_channel_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Trigger and attach it to channel_content_tags
DROP TRIGGER IF EXISTS trigger_update_tags_count ON public.channel_content_tags;

CREATE TRIGGER trigger_update_tags_count
AFTER INSERT OR DELETE ON public.channel_content_tags
FOR EACH ROW
EXECUTE FUNCTION update_post_and_channel_tags_count();
