CREATE OR REPLACE FUNCTION increment_download(p_post_id UUID, p_table_type TEXT DEFAULT 'posts', p_box_id UUID DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_author_id UUID;
BEGIN
  IF p_table_type = 'posts' THEN
    UPDATE public.posts SET downloads_count = COALESCE(downloads_count, 0) + 1 WHERE id = p_post_id RETURNING author_id INTO v_author_id;
    IF v_author_id IS NOT NULL THEN
      UPDATE public.profiles SET downloads_count = COALESCE(downloads_count, 0) + 1 WHERE id = v_author_id;
    END IF;
  ELSIF p_table_type = 'box_items' THEN
    -- Increment the box item downloads
    UPDATE public.box_items SET downloads_count = COALESCE(downloads_count, 0) + 1 WHERE post_id = p_post_id AND box_id = p_box_id;
    
    -- Also increment the original post so we track global downloads!
    UPDATE public.posts SET downloads_count = COALESCE(downloads_count, 0) + 1 WHERE id = p_post_id RETURNING author_id INTO v_author_id;
    IF v_author_id IS NOT NULL THEN
      UPDATE public.profiles SET downloads_count = COALESCE(downloads_count, 0) + 1 WHERE id = v_author_id;
    END IF;
    
  ELSIF p_table_type = 'channel_posts' THEN
    UPDATE public.channel_posts SET downloads_count = COALESCE(downloads_count, 0) + 1 WHERE id = p_post_id RETURNING author_id INTO v_author_id;
    IF v_author_id IS NOT NULL THEN
      UPDATE public.profiles SET downloads_count = COALESCE(downloads_count, 0) + 1 WHERE id = v_author_id;
    END IF;
  END IF;
END;
$$;
