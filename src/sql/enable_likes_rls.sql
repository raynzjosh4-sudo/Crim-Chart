-- Enable RLS on post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Allow users to read all post_likes (so they can see counts or if they liked it)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.post_likes;
CREATE POLICY "Enable read access for all users" ON public.post_likes
    FOR SELECT
    TO public
    USING (true);

-- Enable RLS on box_item_likes
ALTER TABLE public.box_item_likes ENABLE ROW LEVEL SECURITY;

-- Allow users to read all box_item_likes
DROP POLICY IF EXISTS "Enable read access for all users" ON public.box_item_likes;
CREATE POLICY "Enable read access for all users" ON public.box_item_likes
    FOR SELECT
    TO public
    USING (true);
