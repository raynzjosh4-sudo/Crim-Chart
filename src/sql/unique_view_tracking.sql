-- 1. Create the unique views tracking table
CREATE TABLE IF NOT EXISTS public.post_views (
  user_id uuid NOT NULL,
  post_id text NOT NULL, -- Note: TEXT used here to match flexibility of comments table and other areas if needed. If posts strictly use UUID, you can cast it later.
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_views_pkey PRIMARY KEY (user_id, post_id),
  CONSTRAINT post_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
  -- We omit a foreign key to `posts` specifically because `post_id` could refer to a channel_post or a box_item depending on context.
);

-- Enable RLS so it's secure
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert their own view" ON public.post_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view views" ON public.post_views
  FOR SELECT USING (true);


-- 2. Drop the old function just in case the signature was cached incorrectly
DROP FUNCTION IF EXISTS public.increment_view(text, text, text);
DROP FUNCTION IF EXISTS public.increment_view(uuid, text, uuid);

-- 3. Create the secure RPC function
CREATE OR REPLACE FUNCTION increment_view(p_post_id text, p_table_type text DEFAULT 'posts', p_box_id text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the current authenticated user
  v_user_id := auth.uid();
  
  -- If not logged in, we optionally don't track the view, or you could allow anonymous tracking. 
  -- We'll require auth for unique tracking.
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Attempt to insert the unique view. 
  -- If the user already viewed this post, it will violate the primary key constraint.
  -- The ON CONFLICT DO NOTHING prevents an error and allows us to silently ignore the duplicate view.
  INSERT INTO public.post_views (user_id, post_id)
  VALUES (v_user_id, p_post_id)
  ON CONFLICT (user_id, post_id) DO NOTHING;

  -- If the insert was successful (a row was affected), then we actually increment the count!
  IF FOUND THEN
    IF p_table_type = 'posts' THEN
      UPDATE public.posts SET views_count = COALESCE(views_count, 0) + 1 WHERE id::text = p_post_id;
      
    ELSIF p_table_type = 'box_items' THEN
      UPDATE public.box_items SET views_count = COALESCE(views_count, 0) + 1 WHERE post_id::text = p_post_id AND box_id::text = p_box_id;
      UPDATE public.posts SET views_count = COALESCE(views_count, 0) + 1 WHERE id::text = p_post_id;
      
    ELSIF p_table_type = 'channel_posts' THEN
      UPDATE public.channel_posts SET views_count = COALESCE(views_count, 0) + 1 WHERE id::text = p_post_id;
      
    END IF;
  END IF;

END;
$$;

-- 4. Notify PostgREST to reload its schema cache to fix the PGRST202 error
NOTIFY pgrst, 'reload schema';
