-- Trigger function to automatically increment comments_count globally
CREATE OR REPLACE FUNCTION handle_new_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Since we use UUIDs for our posts, the ID is guaranteed to be globally unique.
  -- We can safely attempt to increment the count across all tables that support comments.
  -- The database will only update the exact row where the UUID matches.
  
  -- 1. Try updating channel_posts
  BEGIN
    UPDATE public.channel_posts 
    SET comments_count = COALESCE(comments_count, 0) + 1 
    WHERE id = NEW.post_id::uuid;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error updating channel_posts: %', SQLERRM;
  END;

  -- 2. Try updating standard posts
  BEGIN
    UPDATE public.posts 
    SET comments_count = COALESCE(comments_count, 0) + 1 
    WHERE id = NEW.post_id::uuid;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error updating posts: %', SQLERRM;
  END;
  
  -- 3. You can easily add more tables here in the future if they need comment counts
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to the comments table
DROP TRIGGER IF EXISTS on_comment_inserted ON public.comments;
CREATE TRIGGER on_comment_inserted
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_comment();
s