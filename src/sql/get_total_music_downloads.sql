CREATE OR REPLACE FUNCTION public.get_total_music_downloads(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_downloads integer := 0;
    post_dl integer := 0;
    channel_dl integer := 0;
BEGIN
    -- 1. Get downloads from standard posts where the user is the author and it is audio
    SELECT COALESCE(SUM(downloads_count), 0) INTO post_dl
    FROM public.posts
    WHERE author_id = p_user_id AND is_audio = true;

    -- 2. Get downloads from channel posts where the user is the author and it is audio
    SELECT COALESCE(SUM(downloads_count), 0) INTO channel_dl
    FROM public.channel_posts
    WHERE author_id = p_user_id AND is_audio = true;

    -- 3. We skip box_items because box downloads already increment public.posts.downloads_count

    -- Calculate total
    total_downloads := post_dl + channel_dl;

    RETURN total_downloads;
END;
$$;
