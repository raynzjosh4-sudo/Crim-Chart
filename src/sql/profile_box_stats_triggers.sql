-- Add columns to profiles for box stats
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS boxes_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS box_submissions_count integer DEFAULT 0;

-- ==========================================
-- TRIGGER: Increment boxes_count on Profile
-- ==========================================
CREATE OR REPLACE FUNCTION public.increment_boxes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET boxes_count = COALESCE(boxes_count, 0) + 1 
    WHERE id = NEW.owner_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET boxes_count = GREATEST(COALESCE(boxes_count, 0) - 1, 0) 
    WHERE id = OLD.owner_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_boxes_count ON public.boxes;
CREATE TRIGGER trigger_increment_boxes_count
AFTER INSERT OR DELETE ON public.boxes
FOR EACH ROW EXECUTE FUNCTION public.increment_boxes_count();

-- ==========================================
-- TRIGGER: Increment box_submissions_count 
-- ==========================================
-- This increments the box_submissions_count for the box OWNER 
-- when someone ELSE adds an item to their box.
CREATE OR REPLACE FUNCTION public.increment_box_submissions()
RETURNS TRIGGER AS $$
DECLARE
  v_box_owner_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get the owner of the box this item is being added to
    SELECT owner_id INTO v_box_owner_id FROM public.boxes WHERE id = NEW.box_id;
    
    -- If the person performing the insert is NOT the box owner, increment the submission count
    IF v_box_owner_id != auth.uid() THEN
      UPDATE public.profiles 
      SET box_submissions_count = COALESCE(box_submissions_count, 0) + 1 
      WHERE id = v_box_owner_id;
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    SELECT owner_id INTO v_box_owner_id FROM public.boxes WHERE id = OLD.box_id;
    
    -- We can't strictly know if it was added by someone else during delete without an added_by column,
    -- but usually, if a submission is removed, we decrement if we assume it was a submission.
    -- However, to prevent drifting counts, we'll only do it if the person deleting isn't the owner,
    -- or we skip decrementing. Let's just decrement it blindly if it's deleted by someone else or the owner removing a submission.
    -- Actually, safest is to only track inserts if we can't reliably track deletes.
    -- Let's just track inserts for "submissions count".
    
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_box_submissions ON public.box_items;
CREATE TRIGGER trigger_increment_box_submissions
AFTER INSERT ON public.box_items
FOR EACH ROW EXECUTE FUNCTION public.increment_box_submissions();
