CREATE OR REPLACE FUNCTION increment_download(p_post_id UUID, p_table_type TEXT DEFAULT 'posts', p_box_id UUID DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_table_type = 'posts' THEN
    UPDATE public.posts SET downloads_count = COALESCE(downloads_count, 0) + 1 WHERE id = p_post_id;
  ELSIF p_table_type = 'box_items' THEN
    -- Increment the box item downloads
    UPDATE public.box_items SET downloads_count = COALESCE(downloads_count, 0) + 1 WHERE post_id = p_post_id AND box_id = p_box_id;
    
    -- Also increment the original post so we track global downloads!
    UPDATE public.posts SET downloads_count = COALESCE(downloads_count, 0) + 1 WHERE id = p_post_id;
    
  ELSIF p_table_type = 'channel_posts' THEN
    UPDATE public.channel_posts SET downloads_count = COALESCE(downloads_count, 0) + 1 WHERE id = p_post_id;
    
    -- Option: If channel posts are completely separate entities, the above is enough. 
    -- If they map back to a global post table, you would do a second update here.
  END IF;
END;
$$;
