-- 1. Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT post_likes_unique_like UNIQUE (user_id, post_id),
  CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
  -- Note: ensure user_id foreign key matches your users table if applicable
) TABLESPACE pg_default;

-- 2. Create box_item_likes table
CREATE TABLE IF NOT EXISTS public.box_item_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  box_item_id uuid NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT box_item_likes_pkey PRIMARY KEY (id),
  CONSTRAINT box_item_likes_unique_like UNIQUE (user_id, box_item_id),
  CONSTRAINT box_item_likes_box_item_id_fkey FOREIGN KEY (box_item_id) REFERENCES box_items (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 3. Triggers for posts.likes_count
CREATE OR REPLACE FUNCTION increment_post_likes_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.posts SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_post_likes_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.posts SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trigger_increment_post_likes ON public.post_likes;
CREATE TRIGGER trigger_increment_post_likes
AFTER INSERT ON public.post_likes FOR EACH ROW
EXECUTE FUNCTION increment_post_likes_count();

DROP TRIGGER IF EXISTS trigger_decrement_post_likes ON public.post_likes;
CREATE TRIGGER trigger_decrement_post_likes
AFTER DELETE ON public.post_likes FOR EACH ROW
EXECUTE FUNCTION decrement_post_likes_count();

-- 4. Triggers for box_items.likes_count
CREATE OR REPLACE FUNCTION increment_box_item_likes_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.box_items SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.box_item_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_box_item_likes_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.box_items SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.box_item_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trigger_increment_box_item_likes ON public.box_item_likes;
CREATE TRIGGER trigger_increment_box_item_likes
AFTER INSERT ON public.box_item_likes FOR EACH ROW
EXECUTE FUNCTION increment_box_item_likes_count();

DROP TRIGGER IF EXISTS trigger_decrement_box_item_likes ON public.box_item_likes;
CREATE TRIGGER trigger_decrement_box_item_likes
AFTER DELETE ON public.box_item_likes FOR EACH ROW
EXECUTE FUNCTION decrement_box_item_likes_count();

-- 5. Unified RPC for toggling likes contextually
CREATE OR REPLACE FUNCTION toggle_like(p_post_id UUID, p_box_id UUID DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_post_like_id UUID;
  v_box_item_id UUID;
  v_box_item_like_id UUID;
  v_global_action TEXT := 'none';
  v_box_action TEXT := 'none';
BEGIN
  -- We assume auth.uid() is the user making the request. 
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- A. Handle Global Post Like
  SELECT id INTO v_post_like_id FROM public.post_likes WHERE post_id = p_post_id AND user_id = v_user_id;

  IF v_post_like_id IS NOT NULL THEN
    -- Toggle OFF global like
    DELETE FROM public.post_likes WHERE id = v_post_like_id;
    v_global_action := 'unliked';
  ELSE
    -- Toggle ON global like
    INSERT INTO public.post_likes (post_id, user_id) VALUES (p_post_id, v_user_id);
    v_global_action := 'liked';
  END IF;

  -- B. Handle Box Item Like (if context provided)
  IF p_box_id IS NOT NULL THEN
    -- Get the box_item_id for this post in this box
    SELECT id INTO v_box_item_id FROM public.box_items WHERE box_id = p_box_id AND post_id = p_post_id;
    
    IF v_box_item_id IS NOT NULL THEN
      SELECT id INTO v_box_item_like_id FROM public.box_item_likes WHERE box_item_id = v_box_item_id AND user_id = v_user_id;
      
      IF v_box_item_like_id IS NOT NULL THEN
        -- Toggle OFF box item like
        DELETE FROM public.box_item_likes WHERE id = v_box_item_like_id;
        v_box_action := 'unliked';
      ELSE
        -- Toggle ON box item like
        INSERT INTO public.box_item_likes (box_item_id, user_id) VALUES (v_box_item_id, v_user_id);
        v_box_action := 'liked';
      END IF;
    ELSE
      v_box_action := 'box_item_not_found';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'global_action', v_global_action, 
    'box_action', v_box_action
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
