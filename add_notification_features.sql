ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY['like', 'comment', 'follow', 'channel_invite', 'channel_request', 'mention', 'post_tag', 'post']));

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_text text;
