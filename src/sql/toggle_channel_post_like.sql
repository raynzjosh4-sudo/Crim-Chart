-- Function to toggle likes on channel posts
DROP FUNCTION IF EXISTS toggle_channel_post_like(UUID);

CREATE TABLE IF NOT EXISTS public.channel_post_likes (
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT channel_post_likes_pkey PRIMARY KEY (user_id, post_id),
  CONSTRAINT channel_post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT channel_post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.channel_posts(id)
);

CREATE OR REPLACE FUNCTION toggle_channel_post_like(p_post_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_like_exists BOOLEAN;
BEGIN
  -- We assume auth.uid() is the user making the request. 
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check if like already exists
  SELECT EXISTS(
    SELECT 1 FROM public.channel_post_likes 
    WHERE post_id = p_post_id AND user_id = v_user_id
  ) INTO v_like_exists;

  IF v_like_exists THEN
    -- Toggle OFF like
    DELETE FROM public.channel_post_likes 
    WHERE post_id = p_post_id AND user_id = v_user_id;
    
    -- Decrement the count on channel_posts table
    UPDATE public.channel_posts 
    SET likes = GREATEST(likes - 1, 0)
    WHERE id = p_post_id;

    RETURN jsonb_build_object('success', true, 'action', 'unliked');
  ELSE
    -- Toggle ON like
    INSERT INTO public.channel_post_likes (post_id, user_id) 
    VALUES (p_post_id, v_user_id);
    
    -- Increment the count on channel_posts table
    UPDATE public.channel_posts 
    SET likes = likes + 1
    WHERE id = p_post_id;

    RETURN jsonb_build_object('success', true, 'action', 'liked');
  END IF;
END;
$$;

-- Grant permissions so the frontend can query the channel_post_likes table
GRANT SELECT, INSERT, DELETE ON public.channel_post_likes TO anon, authenticated;

-- Force Supabase to reload its schema cache so the table becomes visible to the API
NOTIFY pgrst, 'reload schema';
