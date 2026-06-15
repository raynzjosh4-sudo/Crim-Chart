-- Migration to create global comments table in Supabase
-- This table handles comments for posts, channels, boxes, etc.

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    author_username TEXT,
    author_avatar_url TEXT,
    text TEXT,
    media_url TEXT,
    media_type TEXT,
    reply_to_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    likes_count INT DEFAULT 0
);

-- Optimize for "where post_id = X order by created_at desc" which handles our feed of millions
CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at ON public.comments (post_id, created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read comments
CREATE POLICY "Comments are publicly readable" 
ON public.comments FOR SELECT 
USING (true);

-- Allow authenticated users to insert their own comments
CREATE POLICY "Users can insert their own comments" 
ON public.comments FOR INSERT 
WITH CHECK (auth.uid()::text = author_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments" 
ON public.comments FOR DELETE 
USING (auth.uid()::text = author_id);

-- Allow real-time for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
