-- Run this script in the Supabase SQL Editor
-- This adds advanced visibility restrictions to the boxes table

ALTER TABLE public.boxes
ADD COLUMN age_restriction text DEFAULT 'All Ages',
ADD COLUMN country_restrictions jsonb DEFAULT '["Global"]'::jsonb,
ADD COLUMN visible_to_followed_users boolean DEFAULT true;
