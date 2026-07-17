-- Add the received_tags column back to the profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS received_tags jsonb DEFAULT '[]'::jsonb;
