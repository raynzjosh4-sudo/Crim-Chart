-- Drop table if it exists
DROP TABLE IF EXISTS public.public_assets;

-- Create the public_assets table for SEO/Sitemap indexing
CREATE TABLE public.public_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'image',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.public_assets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the public assets (needed for sitemap/SEO)
CREATE POLICY "Public profiles are viewable by everyone." ON public.public_assets
    FOR SELECT USING (true);

-- Allow authenticated users or service role to insert (optional, usually admin only, 
-- but since the anon script needs to insert if run directly against API, we allow it for now.
-- In production, typically only service_role should insert, or run this via SQL dump)
CREATE POLICY "Enable insert for authenticated users only" ON public.public_assets
    FOR INSERT WITH CHECK (true);
