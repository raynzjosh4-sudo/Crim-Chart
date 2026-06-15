-- 1. Drop the unique constraint so users can have multiple reactions over time (like messages/statuses)
ALTER TABLE public.box_item_reactions 
DROP CONSTRAINT IF EXISTS box_reactions_unique;

-- 2. Create the RPC function that takes interaction_type and saves the row
CREATE OR REPLACE FUNCTION record_box_item_reaction(
  p_post_id UUID,
  p_box_id UUID,
  p_reaction_type TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_box_item_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Find the box_item_id based on post_id and box_id
  SELECT id INTO v_box_item_id
  FROM public.box_items
  WHERE post_id = p_post_id AND box_id = p_box_id;

  IF v_box_item_id IS NULL THEN
    -- If it doesn't exist, we cannot record a box item reaction
    RETURN jsonb_build_object('success', false, 'error', 'Box item not found');
  END IF;

  -- Insert the reaction event
  INSERT INTO public.box_item_reactions (box_item_id, user_id, reaction_type, created_at)
  VALUES (v_box_item_id, v_user_id, p_reaction_type, now());

  RETURN jsonb_build_object('success', true, 'message', 'Interaction recorded successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 3. Create a cleanup function that automatically deletes interactions older than 24 hours
-- In Supabase, you can schedule this function using pg_cron (if enabled) or call it via a daily edge function
CREATE OR REPLACE FUNCTION cleanup_old_box_item_reactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.box_item_reactions
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;
