-- Create the comment_likes tracking table
CREATE TABLE IF NOT EXISTS public.comment_likes (
  user_id uuid NOT NULL,
  comment_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comment_likes_pkey PRIMARY KEY (user_id, comment_id),
  CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Allow users to see all comment likes
CREATE POLICY "Anyone can view comment likes" ON public.comment_likes
  FOR SELECT USING (true);

-- Allow authenticated users to insert/delete their own likes
CREATE POLICY "Users can insert their own comment likes" ON public.comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes" ON public.comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create the secure RPC function to toggle comment likes
CREATE OR REPLACE FUNCTION toggle_comment_like(p_comment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_exists boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.comment_likes 
    WHERE user_id = v_user_id AND comment_id = p_comment_id
  ) INTO v_exists;

  IF v_exists THEN
    -- Unlike
    DELETE FROM public.comment_likes WHERE user_id = v_user_id AND comment_id = p_comment_id;
    UPDATE public.comments SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1) WHERE id = p_comment_id;
  ELSE
    -- Like
    INSERT INTO public.comment_likes (user_id, comment_id) VALUES (v_user_id, p_comment_id);
    UPDATE public.comments SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = p_comment_id;
  END IF;
END;
$$;
