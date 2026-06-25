-- Add allow_chatting_by column to channels
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS allow_chatting_by TEXT DEFAULT 'all';

-- Add can_chat column to channel_members
ALTER TABLE public.channel_members ADD COLUMN IF NOT EXISTS can_chat BOOLEAN DEFAULT true;
