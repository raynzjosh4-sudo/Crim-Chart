-- ============================================================
-- Migration: add `category` column to posts, channel_posts
-- and the local music_feed cache table.
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- 1. posts table (global user posts)
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. channel_posts table
ALTER TABLE public.channel_posts
  ADD COLUMN IF NOT EXISTS category TEXT;

-- Optional: index for fast filtering by category in the music feed
CREATE INDEX IF NOT EXISTS idx_posts_category
  ON public.posts (category)
  WHERE audio_url IS NOT NULL AND audio_url != '';

CREATE INDEX IF NOT EXISTS idx_channel_posts_category
  ON public.channel_posts (category)
  WHERE audio_url IS NOT NULL AND audio_url != '';
