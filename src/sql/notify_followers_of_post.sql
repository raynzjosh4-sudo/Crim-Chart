-- Create a function to notify all followers when a user posts a video
CREATE OR REPLACE FUNCTION notify_followers_of_post(
    p_author_id UUID,
    p_post_id UUID,
    p_action_text TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO notifications (
        recipient_id,
        actor_id,
        type,
        action_text,
        reference_id,
        created_at
    )
    SELECT
        follower_id,
        p_author_id,
        'post',
        p_action_text,
        p_post_id,
        NOW()
    FROM user_followers
    WHERE following_id = p_author_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
