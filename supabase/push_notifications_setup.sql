-- 1. Create table for storing push tokens
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token text NOT NULL,
    platform text NOT NULL, -- 'ios', 'android', or 'web'
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, token)
);

-- Enable RLS
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own tokens
DROP POLICY IF EXISTS "Users can insert their own push tokens" ON public.user_push_tokens;
CREATE POLICY "Users can insert their own push tokens" 
    ON public.user_push_tokens 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own tokens
DROP POLICY IF EXISTS "Users can view their own push tokens" ON public.user_push_tokens;
CREATE POLICY "Users can view their own push tokens" 
    ON public.user_push_tokens 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Allow users to delete their own tokens (e.g. on logout)
DROP POLICY IF EXISTS "Users can delete their own push tokens" ON public.user_push_tokens;
CREATE POLICY "Users can delete their own push tokens" 
    ON public.user_push_tokens 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Allow users to update their own tokens
DROP POLICY IF EXISTS "Users can update their own push tokens" ON public.user_push_tokens;
CREATE POLICY "Users can update their own push tokens" 
    ON public.user_push_tokens 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 2. Ensure pg_net is enabled (Required for Database Webhooks)
CREATE EXTENSION IF NOT EXISTS pg_net;


-- 3. Create the Trigger Function to send the Push Notification
CREATE OR REPLACE FUNCTION public.send_push_notification_on_insert()
RETURNS TRIGGER AS $$
DECLARE
    target_push_token record;
    expo_payload json;
    notification_title text := 'New Notification';
    notification_body text := 'You have a new update in Crimchart!';
    sender_name text;
    push_data json;
    request_id bigint;
BEGIN
    -- We don't send push notifications to ourselves
    IF NEW.user_id = NEW.sender_id THEN
        RETURN NEW;
    END IF;

    -- Fetch sender's name for a better push title/body
    SELECT display_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
    IF sender_name IS NULL THEN
        sender_name := 'Someone';
    END IF;

    -- Format the message based on the type
    IF NEW.type = 'like' THEN
        notification_title := 'New Like';
        notification_body := sender_name || ' liked your post.';
    ELSIF NEW.type = 'comment' THEN
        notification_title := 'New Comment';
        notification_body := sender_name || ' commented on your post.';
    ELSIF NEW.type = 'follow' THEN
        notification_title := 'New Follower';
        notification_body := sender_name || ' started following you.';
    ELSIF NEW.type = 'mention' THEN
        notification_title := 'Mention';
        notification_body := sender_name || ' mentioned you.';
    ELSE
        notification_title := 'Crimchart Update';
        notification_body := sender_name || ' interacted with you.';
    END IF;

    -- Data payload for the app to navigate when clicked
    push_data := json_build_object(
        'notification_id', NEW.id,
        'type', NEW.type,
        'post_id', NEW.post_id,
        'sender_id', NEW.sender_id
    );

    -- Loop through all Expo (mobile) push tokens for the recipient user
    FOR target_push_token IN 
        SELECT token, platform 
        FROM public.user_push_tokens 
        WHERE user_id = NEW.user_id AND platform IN ('ios', 'android')
    LOOP
        -- Construct the Expo Push Notification Payload
        expo_payload := json_build_object(
            'to', target_push_token.token,
            'sound', 'default',
            'title', notification_title,
            'body', notification_body,
            'data', push_data
        );

        -- Make the HTTP request using pg_net
        SELECT net.http_post(
            url := 'https://exp.host/--/api/v2/push/send',
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := expo_payload::jsonb
        ) INTO request_id;
    END LOOP;

    -- Note: For FCM (Web), the implementation requires OAuth tokens or Server Keys
    -- For now, this handles all mobile (Expo) push notifications 100% free!

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Attach the Trigger to the notifications table
DROP TRIGGER IF EXISTS trg_send_push_notification ON public.notifications;

CREATE TRIGGER trg_send_push_notification
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.send_push_notification_on_insert();
