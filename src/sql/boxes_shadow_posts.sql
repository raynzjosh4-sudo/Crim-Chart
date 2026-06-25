-- 1. Add post_id column to boxes if it doesn't exist
ALTER TABLE public.boxes ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;

-- 2. Backfill existing boxes
DO $$
DECLARE
    v_box RECORD;
    v_post_id UUID;
BEGIN
    FOR v_box IN SELECT id, title, owner_id, metadata FROM public.boxes WHERE post_id IS NULL LOOP
        -- Insert a shadow post
        INSERT INTO public.posts (
            author_id, 
            caption, 
            privacy, 
            allow_comments, 
            metadata
        ) VALUES (
            v_box.owner_id, 
            COALESCE(v_box.title, 'A Box'), 
            'public', 
            true, 
            jsonb_build_object('is_box_shadow_post', true, 'box_id', v_box.id)
        ) RETURNING id INTO v_post_id;

        -- Update the box with the new post_id
        UPDATE public.boxes SET post_id = v_post_id WHERE id = v_box.id;
    END LOOP;
END $$;

-- 3. Create a trigger function to automatically create a shadow post for new boxes
CREATE OR REPLACE FUNCTION trg_create_box_shadow_post()
RETURNS trigger AS $$
DECLARE
    v_post_id UUID;
BEGIN
    -- Only create if not already provided (e.g. from an explicit insert)
    IF NEW.post_id IS NULL THEN
        INSERT INTO public.posts (
            author_id, 
            caption, 
            privacy, 
            allow_comments, 
            metadata
        ) VALUES (
            NEW.owner_id, 
            COALESCE(NEW.title, 'A Box'), 
            'public', 
            true, 
            jsonb_build_object('is_box_shadow_post', true, 'box_id', NEW.id)
        ) RETURNING id INTO v_post_id;
        
        NEW.post_id := v_post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Attach the trigger to the boxes table
DROP TRIGGER IF EXISTS trigger_box_shadow_post ON public.boxes;
CREATE TRIGGER trigger_box_shadow_post
BEFORE INSERT ON public.boxes
FOR EACH ROW
EXECUTE FUNCTION trg_create_box_shadow_post();
