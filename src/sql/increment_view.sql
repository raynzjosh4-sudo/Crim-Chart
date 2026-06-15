-- Function to safely increment the views_count for different post types
CREATE OR REPLACE FUNCTION increment_view(p_post_id TEXT, p_table_type TEXT DEFAULT 'posts', p_box_id TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_table_type = 'posts' THEN
    UPDATE public.posts SET views_count = COALESCE(views_count, 0) + 1 WHERE id = p_post_id;
  ELSIF p_table_type = 'box_items' THEN
    -- Increment the box item views
    UPDATE public.box_items SET views_count = COALESCE(views_count, 0) + 1 WHERE post_id = p_post_id AND box_id = p_box_id;
    
    -- Also increment the original post so we track global views!
    UPDATE public.posts SET views_count = COALESCE(views_count, 0) + 1 WHERE id = p_post_id;
    
  ELSIF p_table_type = 'channel_posts' THEN
    UPDATE public.channel_posts SET views_count = COALESCE(views_count, 0) + 1 WHERE id = p_post_id;
    
  END IF;
END;
$$;
