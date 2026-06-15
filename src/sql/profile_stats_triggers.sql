-- 1. Add missing columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS posts_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS inbox_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS channels_created_count integer DEFAULT 0;

-- ==========================================
-- TRIGGER: Increment channels_created_count 
-- ==========================================
CREATE OR REPLACE FUNCTION public.increment_channels_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET channels_created_count = COALESCE(channels_created_count, 0) + 1 
    WHERE id = NEW.creator_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET channels_created_count = GREATEST(COALESCE(channels_created_count, 0) - 1, 0) 
    WHERE id = OLD.creator_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_channels_count ON public.channels;
CREATE TRIGGER trigger_increment_channels_count
AFTER INSERT OR DELETE ON public.channels
FOR EACH ROW EXECUTE FUNCTION public.increment_channels_count();

-- ==========================================
-- TRIGGER: Increment posts_count 
-- ==========================================
CREATE OR REPLACE FUNCTION public.increment_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET posts_count = COALESCE(posts_count, 0) + 1 
    WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET posts_count = GREATEST(COALESCE(posts_count, 0) - 1, 0) 
    WHERE id = OLD.author_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_posts_count ON public.posts;
CREATE TRIGGER trigger_increment_posts_count
AFTER INSERT OR DELETE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.increment_posts_count();

-- ==========================================
-- TRIGGER: Increment followers_count & following_count
-- ==========================================
-- Table 'follows' typically has follower_id (person doing the following) 
-- and following_id (person being followed)
CREATE OR REPLACE FUNCTION public.increment_follows_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- The person who is followed gets a new follower
    UPDATE public.profiles 
    SET followers_count = COALESCE(followers_count, 0) + 1 
    WHERE id = NEW.following_id;
    
    -- The person doing the following gets a higher following count
    UPDATE public.profiles 
    SET following_count = COALESCE(following_count, 0) + 1 
    WHERE id = NEW.follower_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) 
    WHERE id = OLD.following_id;
    
    UPDATE public.profiles 
    SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) 
    WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_follows_count ON public.follows;
CREATE TRIGGER trigger_increment_follows_count
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.increment_follows_count();

-- ==========================================
-- TRIGGER: Increment inbox_count
-- ==========================================
-- When a new thread starts, the receiver gets a new inbox count.
CREATE OR REPLACE FUNCTION public.increment_inbox_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET inbox_count = COALESCE(inbox_count, 0) + 1 
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET inbox_count = GREATEST(COALESCE(inbox_count, 0) - 1, 0) 
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_inbox_count ON public.inbox;
CREATE TRIGGER trigger_increment_inbox_count
AFTER INSERT OR DELETE ON public.inbox
FOR EACH ROW EXECUTE FUNCTION public.increment_inbox_count();
