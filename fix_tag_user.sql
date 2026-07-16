CREATE OR REPLACE FUNCTION tag_user_on_post(
  p_post_id UUID, 
  p_target_user_id UUID, 
  p_source_table TEXT DEFAULT 'posts'
) RETURNS void AS $$
DECLARE
  v_actor_id UUID;
BEGIN 
  -- Insert only if the tag doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM post_tags WHERE post_id = p_post_id AND user_id = p_target_user_id) THEN
    INSERT INTO post_tags (post_id, user_id) VALUES (p_post_id, p_target_user_id);
    
    -- Update tags_count based on source table
    IF p_source_table = 'posts' THEN 
      UPDATE public.posts SET tags_count = COALESCE(tags_count, 0) + 1 WHERE id = p_post_id; 
    ELSIF p_source_table = 'channel_posts' THEN 
      UPDATE public.channel_posts SET tags_count = COALESCE(tags_count, 0) + 1 WHERE id = p_post_id; 
    END IF;

    -- Get the current user
    v_actor_id := auth.uid();
    
    -- Send notification
    IF v_actor_id IS NOT NULL AND v_actor_id != p_target_user_id THEN
      INSERT INTO notifications (recipient_id, actor_id, type, reference_id)
      VALUES (p_target_user_id, v_actor_id, 'post_tag', p_post_id);
    END IF;
  END IF;
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;
