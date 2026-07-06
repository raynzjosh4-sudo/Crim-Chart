-- Fix "operator does not exist: uuid <> text" and "uuid = text" by casting NEW fields to uuid

-- 1. Update Like Notification Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_like_notification()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
BEGIN
    -- Get the owner of the post by casting NEW.post_id to uuid
    SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id::uuid;
    
    -- Only create notification if it's not a self-like
    IF post_owner_id != NEW.user_id::uuid THEN
        INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id)
        VALUES (post_owner_id, NEW.user_id::uuid, 'like', NEW.post_id::uuid);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Comment Notification Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
BEGIN
    -- Check global posts by casting NEW.post_id to uuid
    SELECT author_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id::uuid;
    
    -- If not found, check channel posts
    IF post_owner_id IS NULL THEN
        SELECT author_id INTO post_owner_id FROM public.channel_posts WHERE id = NEW.post_id::uuid;
    END IF;

    IF post_owner_id IS NOT NULL AND post_owner_id != NEW.author_id::uuid THEN
        INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id)
        VALUES (post_owner_id, NEW.author_id::uuid, 'comment', NEW.post_id::uuid);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
