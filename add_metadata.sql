-- Run this in your Supabase SQL Editor to add the metadata column

ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.channel_posts 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
