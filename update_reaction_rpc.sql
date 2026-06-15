-- 1. Create the RPC function that deletes ANY action of the same type for this user inside the box
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

  -- Enforce absolute uniqueness per box: 
  -- Delete ALL existing actions of this reaction_type for this user in this entire box!
  -- This ensures the UI only ever gets 1 row per reaction type per user in a box.
  DELETE FROM public.box_item_reactions
  WHERE user_id = v_user_id
    AND reaction_type = p_reaction_type
    AND box_item_id IN (
      SELECT id FROM public.box_items WHERE box_id = p_box_id
    );

  -- Insert the new reaction
  INSERT INTO public.box_item_reactions (box_item_id, user_id, reaction_type, created_at)
  VALUES (v_box_item_id, v_user_id, p_reaction_type, now());

  RETURN jsonb_build_object('success', true, 'message', 'Interaction recorded successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
