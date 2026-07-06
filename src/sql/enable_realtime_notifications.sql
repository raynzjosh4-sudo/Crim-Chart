-- Enable Realtime for the notifications table
-- This allows the Supabase client to receive INSERT/UPDATE events instantly without reloading the app

-- Add the table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
