ALTER TABLE public.boxes 
ADD COLUMN IF NOT EXISTS allow_submissions boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;
