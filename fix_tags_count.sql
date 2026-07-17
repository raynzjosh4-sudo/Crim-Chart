-- Fix for User Tagging (updates post_tags)
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


-- Fix for Channel Tagging (updates channel_content_tags)
CREATE OR REPLACE FUNCTION increment_channel_content_tag_count()
RETURNS TRIGGER AS $$
BEGIN
  -- We assume that the tag could be for a post or a channel_post
  -- Let's try updating posts first. If not found, try channel_posts
  UPDATE public.posts 
  SET tags_count = COALESCE(tags_count, 0) + 1 
  WHERE id = NEW.post_id;

  -- If it wasn't a global post, it will return found = false. 
  -- However, plpgsql does not strictly set FOUND for UPDATEs without GET DIAGNOSTICS in some cases, 
  -- but we can safely just run the update on channel_posts too because if the UUID isn't there, it does nothing.
  UPDATE public.channel_posts 
  SET tags_count = COALESCE(tags_count, 0) + 1 
  WHERE id = NEW.post_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trg_increment_channel_content_tag_count ON public.channel_content_tags;

-- Create trigger on channel_content_tags
CREATE TRIGGER trg_increment_channel_content_tag_count
AFTER INSERT ON public.channel_content_tags
FOR EACH ROW
EXECUTE FUNCTION increment_channel_content_tag_count();
