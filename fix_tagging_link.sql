-- Add tagger_id to post_tags so we know who tagged the user
ALTER TABLE public.post_tags
ADD COLUMN IF NOT EXISTS tagger_id UUID REFERENCES public.profiles(id);

-- Rewrite the RPC to update the user's received_tags column
CREATE OR REPLACE FUNCTION tag_user_on_post(p_post_id UUID, p_target_user_id UUID, p_source_table TEXT DEFAULT 'posts') RETURNS void AS $$
DECLARE
  v_tagger_id UUID;
  v_tagger_name TEXT;
  v_tagger_avatar TEXT;
  v_post_name TEXT;
  v_current_tags JSONB;
  v_new_tags JSONB;
BEGIN
  -- 1. Get Tagger ID
  v_tagger_id := auth.uid();
  IF v_tagger_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Insert into post_tags if not already tagged
  IF NOT EXISTS (SELECT 1 FROM post_tags WHERE post_id = p_post_id AND user_id = p_target_user_id) THEN 
    INSERT INTO post_tags (post_id, user_id, tagger_id) VALUES (p_post_id, p_target_user_id, v_tagger_id); 
    
    -- Increment counts and get post caption
    IF p_source_table = 'posts' THEN 
      UPDATE public.posts SET tags_count = COALESCE(tags_count, 0) + 1 WHERE id = p_post_id; 
      SELECT COALESCE(caption, 'Post') INTO v_post_name FROM public.posts WHERE id = p_post_id;
    ELSIF p_source_table = 'channel_posts' THEN 
      UPDATE public.channel_posts SET tags_count = COALESCE(tags_count, 0) + 1 WHERE id = p_post_id; 
      SELECT COALESCE(caption, 'Post') INTO v_post_name FROM public.channel_posts WHERE id = p_post_id;
    END IF; 

    -- 3. Update profiles.received_tags
    SELECT display_name, profile_image_url INTO v_tagger_name, v_tagger_avatar FROM public.profiles WHERE id = v_tagger_id;
    SELECT COALESCE(received_tags, '[]'::jsonb) INTO v_current_tags FROM public.profiles WHERE id = p_target_user_id;

    -- Check if tagger already exists in the array
    IF EXISTS (
      SELECT 1 FROM jsonb_array_elements(v_current_tags) AS elem
      WHERE elem->>'taggerId' = v_tagger_id::text
    ) THEN
      -- Rebuild the array, appending the new tag to the existing tagger's tags list
      SELECT COALESCE(jsonb_agg(
        CASE
          WHEN elem->>'taggerId' = v_tagger_id::text THEN
            jsonb_set(
              elem,
              '{tags}',
              (elem->'tags') || jsonb_build_object('id', p_post_id, 'name', substring(v_post_name from 1 for 30))
            )
          ELSE elem
        END
      ), '[]'::jsonb) INTO v_new_tags
      FROM jsonb_array_elements(v_current_tags) AS elem;
    ELSE
      -- Append new tagger group
      v_new_tags := v_current_tags || jsonb_build_object(
        'taggerId', v_tagger_id,
        'taggerName', v_tagger_name,
        'taggerAvatar', v_tagger_avatar,
        'tags', jsonb_build_array(jsonb_build_object('id', p_post_id, 'name', substring(v_post_name from 1 for 30)))
      );
    END IF;

    -- Update target user profile
    UPDATE public.profiles SET received_tags = v_new_tags WHERE id = p_target_user_id;
  END IF; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
