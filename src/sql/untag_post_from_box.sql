CREATE OR REPLACE FUNCTION untag_post_from_box(p_box_id UUID, p_post_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete the post from the box
  DELETE FROM public.box_items
  WHERE box_id = p_box_id AND post_id = p_post_id;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  IF v_deleted_count = 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Post was not tagged in this box');
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Post successfully untagged');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
