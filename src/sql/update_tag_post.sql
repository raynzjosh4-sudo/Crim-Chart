-- ==========================================
-- ADD user_id to box_items
-- ==========================================

-- 1. Add user_id column
ALTER TABLE public.box_items
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ==========================================
-- UPDATE tag_post_to_box RPC
-- ==========================================
CREATE OR REPLACE FUNCTION tag_post_to_box(p_box_id UUID, p_post_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_box_item_id UUID;
  v_box_owner_id UUID;
  v_allow_submissions BOOLEAN;
  v_reactor_id UUID := auth.uid();
BEGIN
  -- 1. Check if the box exists and get its settings
  SELECT owner_id, allow_submissions INTO v_box_owner_id, v_allow_submissions
  FROM public.boxes
  WHERE id = p_box_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Box not found');
  END IF;

  -- 2. Check if it's already tagged
  SELECT id INTO v_box_item_id
  FROM public.box_items
  WHERE box_id = p_box_id AND post_id = p_post_id;

  IF v_box_item_id IS NOT NULL THEN
    -- 3a. It is already tagged, so we UNTAG (toggle off)
    DELETE FROM public.box_items WHERE id = v_box_item_id;
    RETURN jsonb_build_object('success', true, 'action', 'untagged', 'message', 'Post successfully untagged from box');
  ELSE
    -- 3b. It is not tagged, so we TAG (toggle on)
    INSERT INTO public.box_items (box_id, post_id, user_id)
    VALUES (p_box_id, p_post_id, v_reactor_id)
    RETURNING id INTO v_box_item_id;
    RETURN jsonb_build_object('success', true, 'action', 'tagged', 'box_item_id', v_box_item_id);
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
