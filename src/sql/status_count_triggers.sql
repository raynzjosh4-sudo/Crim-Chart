-- ==========================================
-- TRIGGER: Update status_count on profiles
-- ==========================================
-- Involving tables:
-- 1. `statuses` (source of truth for user statuses)
-- 2. `profiles` (where `status_count` is cached)

CREATE OR REPLACE FUNCTION public.update_status_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET 
      status_count = COALESCE(status_count, 0) + 1,
      has_status = true
    WHERE id = NEW.author_id;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET 
      status_count = GREATEST(COALESCE(status_count, 0) - 1, 0),
      -- Also update has_status to false if count reaches 0
      has_status = CASE WHEN GREATEST(COALESCE(status_count, 0) - 1, 0) = 0 THEN false ELSE true END
    WHERE id = OLD.author_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_status_count ON public.statuses;
CREATE TRIGGER trigger_update_status_count
AFTER INSERT OR DELETE ON public.statuses
FOR EACH ROW EXECUTE FUNCTION public.update_status_count();

-- ==========================================
-- CRON JOB / CLEANUP FUNCTION for EXPIRED STATUSES
-- ==========================================
-- Note: PostgreSQL triggers do not fire automatically when `expires_at` passes.
-- To ensure `status_count` stays accurate when statuses expire, you should 
-- run this function periodically (e.g., every 5 minutes) using pg_cron, 
-- or call it from a Supabase Edge Function cron job.

CREATE OR REPLACE FUNCTION public.cleanup_expired_statuses()
RETURNS void AS $$
BEGIN
  -- Deleting expired statuses will automatically fire the DELETE trigger above,
  -- which will correctly decrement the `status_count` and update `has_status`!
  DELETE FROM public.statuses 
  WHERE expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- If you have pg_cron enabled in your Supabase database, you can schedule it like this:
-- SELECT cron.schedule('cleanup-expired-statuses', '*/5 * * * *', 'SELECT public.cleanup_expired_statuses()');
