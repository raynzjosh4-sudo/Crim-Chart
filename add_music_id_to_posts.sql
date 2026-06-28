-- Run this snippet in your Supabase SQL Editor to safely add the music_id column to the existing table
-- without dropping any existing data!

ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS music_id UUID;

-- Add the foreign key constraint pointing back to the posts table
ALTER TABLE public.posts
ADD CONSTRAINT posts_music_id_fkey 
FOREIGN KEY (music_id) REFERENCES public.posts(id);
