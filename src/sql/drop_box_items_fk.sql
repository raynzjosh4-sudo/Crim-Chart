-- Run this in your Supabase SQL editor to allow tagging BOTH regular posts and channel posts into boxes
ALTER TABLE public.box_items DROP CONSTRAINT IF EXISTS box_items_post_id_fkey;
