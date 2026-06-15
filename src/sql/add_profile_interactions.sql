-- ==========================================
-- ADD PROFILE UNREAD INTERACTIONS
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Add the column to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS unread_interactions_count INTEGER DEFAULT 0;

-- 2. Create the trigger function to increment the count
CREATE OR REPLACE FUNCTION increment_profile_interactions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  -- Find the owner of the box that the item belongs to
  SELECT b.owner_id INTO v_owner_id
  FROM public.box_items bi
  JOIN public.boxes b ON bi.box_id = b.id
  WHERE bi.id = NEW.box_item_id;

  -- Only increment if the person reacting is NOT the owner of the box
  IF v_owner_id IS NOT NULL AND NEW.user_id != v_owner_id THEN
    UPDATE public.profiles
    SET unread_interactions_count = COALESCE(unread_interactions_count, 0) + 1
    WHERE id = v_owner_id;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Attach the trigger to box_item_reactions
DROP TRIGGER IF EXISTS trigger_increment_profile_interactions ON public.box_item_reactions;
CREATE TRIGGER trigger_increment_profile_interactions
AFTER INSERT ON public.box_item_reactions
FOR EACH ROW
EXECUTE FUNCTION increment_profile_interactions();

-- 4. Create the RPC function to reset it to 0 on read
CREATE OR REPLACE FUNCTION reset_unread_interactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET unread_interactions_count = 0
  WHERE id = auth.uid();
END;
$$;
