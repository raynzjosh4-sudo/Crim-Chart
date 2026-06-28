-- Drop the function if it exists to allow for updates
DROP FUNCTION IF EXISTS get_trending_audio_tracks;

CREATE OR REPLACE FUNCTION get_trending_audio_tracks(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    -- The specific sound being picked (could be a video or a pure audio post)
    post_id UUID,
    media_url TEXT, -- The video_url or audio_url to use for the video editor mixing
    is_video BOOLEAN,
    author_id UUID,
    author_name TEXT,
    author_avatar_url TEXT,
    
    -- The Original Music details (for the UI to link to the real mp3 and the original poster)
    original_music_post_id UUID,
    original_music_url TEXT, -- The real mp3 file for downloading to the phone
    original_author_id UUID,
    original_author_name TEXT,
    
    likes_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        p.id as post_id,
        COALESCE(p.audio_url, p.video_url) as media_url,
        p.is_video,
        pr.id as author_id,
        pr.display_name as author_name,
        pr.profile_image_url as author_avatar_url,
        
        -- Resolution logic:
        -- 1. If music_id exists, that is the Explicit Original Music
        -- 2. Else if parent_post_id exists, that is the Parent Source
        -- 3. Else if this IS an audio post, it is the Original Source
        -- 4. Else NULL
        CASE 
            WHEN music_p.id IS NOT NULL THEN music_p.id
            WHEN parent_p.id IS NOT NULL THEN parent_p.id 
            WHEN p.is_audio = true THEN p.id 
            ELSE NULL 
        END as original_music_post_id,
        
        CASE 
            WHEN music_p.id IS NOT NULL THEN music_p.audio_url
            WHEN parent_p.id IS NOT NULL THEN parent_p.audio_url 
            WHEN p.is_audio = true THEN p.audio_url 
            ELSE NULL 
        END as original_music_url,
        
        CASE 
            WHEN music_p.id IS NOT NULL THEN music_pr.id
            WHEN parent_p.id IS NOT NULL THEN parent_pr.id 
            WHEN p.is_audio = true THEN pr.id 
            ELSE NULL 
        END as original_author_id,
        
        CASE 
            WHEN music_p.id IS NOT NULL THEN music_pr.display_name
            WHEN parent_p.id IS NOT NULL THEN parent_pr.display_name 
            WHEN p.is_audio = true THEN pr.display_name 
            ELSE NULL 
        END as original_author_name,
        
        p.likes_count
    FROM 
        posts p
    JOIN 
        profiles pr ON p.author_id = pr.id
    LEFT JOIN
        posts parent_p ON p.parent_post_id = parent_p.id
    LEFT JOIN
        profiles parent_pr ON parent_p.author_id = parent_pr.id
    LEFT JOIN
        posts music_p ON p.music_id = music_p.id
    LEFT JOIN
        profiles music_pr ON music_p.author_id = music_pr.id
    WHERE 
        (p.is_video = true OR p.is_audio = true)
        AND (p.video_url IS NOT NULL OR p.audio_url IS NOT NULL)
    ORDER BY 
        p.likes_count DESC NULLS LAST,
        p.created_at DESC
    LIMIT p_limit;
$$;
