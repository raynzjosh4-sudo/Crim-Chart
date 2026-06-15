-- ==========================================
-- BOXES FEATURE BACKBONE (HIGH SCALABILITY)
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create the main boxes table
CREATE TABLE IF NOT EXISTS public.boxes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  box_type text NOT NULL, -- e.g., 'music', 'movie', 'store', 'sports', 'voting'
  metadata jsonb DEFAULT '{}'::jsonb, 
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. Create the items table linking media to the box
CREATE TABLE IF NOT EXISTS public.box_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  box_id uuid NOT NULL REFERENCES public.boxes(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.channel_posts(id) ON DELETE CASCADE,
  
  -- Cached counters for extreme performance
  likes_count integer DEFAULT 0,
  dislikes_count integer DEFAULT 0,
  is_viral_pushed boolean DEFAULT false,
  
  added_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT box_items_unique_post UNIQUE (box_id, post_id) 
);

-- 3. Create the community reactions table
CREATE TABLE IF NOT EXISTS public.box_item_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  box_item_id uuid NOT NULL REFERENCES public.box_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL, -- 'like', 'dislike', 'overboard'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT box_reactions_unique UNIQUE (box_item_id, user_id)
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.box_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.box_item_reactions ENABLE ROW LEVEL SECURITY;

-- Read policies (Public)
CREATE POLICY "Boxes viewable by everyone" ON public.boxes FOR SELECT USING (true);
CREATE POLICY "Box items viewable by everyone" ON public.box_items FOR SELECT USING (true);
CREATE POLICY "Reactions viewable by everyone" ON public.box_item_reactions FOR SELECT USING (true);

-- Insert/Update/Delete (Owners)
CREATE POLICY "Users manage own boxes" ON public.boxes FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Owners manage items in own boxes" ON public.box_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.boxes WHERE id = box_items.box_id AND owner_id = auth.uid())
);

-- Anyone can react
CREATE POLICY "Users can insert their own reactions" ON public.box_item_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reactions" ON public.box_item_reactions FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- HIGH-PERFORMANCE TRIGGERS
-- ==========================================
-- Auto-update likes/dislikes on box_items when a reaction is added or removed
CREATE OR REPLACE FUNCTION update_box_item_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'like' THEN
      UPDATE public.box_items SET likes_count = likes_count + 1 WHERE id = NEW.box_item_id;
    ELSIF NEW.reaction_type = 'dislike' THEN
      UPDATE public.box_items SET dislikes_count = dislikes_count + 1 WHERE id = NEW.box_item_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'like' THEN
      UPDATE public.box_items SET likes_count = likes_count - 1 WHERE id = OLD.box_item_id;
    ELSIF OLD.reaction_type = 'dislike' THEN
      UPDATE public.box_items SET dislikes_count = dislikes_count - 1 WHERE id = OLD.box_item_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_box_item_reactions ON public.box_item_reactions;
CREATE TRIGGER trigger_update_box_item_reactions
AFTER INSERT OR DELETE ON public.box_item_reactions
FOR EACH ROW EXECUTE FUNCTION update_box_item_reaction_counts();

-- Viral Push Detection based on item likes instead of box views
CREATE OR REPLACE FUNCTION detect_viral_box_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Push threshold currently set to 500 likes (hardcoded for now, can be dynamic later)
  IF NEW.likes_count >= 500 AND OLD.is_viral_pushed = false THEN
    NEW.is_viral_pushed := true;
    -- Future: Insert row into notifications table here
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_detect_viral_item ON public.box_items;
CREATE TRIGGER trigger_detect_viral_item
BEFORE UPDATE OF likes_count ON public.box_items
FOR EACH ROW EXECUTE FUNCTION detect_viral_box_item();
