-- Add pending_requests_count to channels
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS pending_requests_count INT DEFAULT 0;

-- Create function to update pending_requests_count
CREATE OR REPLACE FUNCTION update_pending_requests_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
        UPDATE public.channels 
        SET pending_requests_count = pending_requests_count + 1
        WHERE id = NEW.channel_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status != 'pending' THEN
        UPDATE public.channels 
        SET pending_requests_count = pending_requests_count - 1
        WHERE id = NEW.channel_id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'pending' THEN
        UPDATE public.channels 
        SET pending_requests_count = pending_requests_count - 1
        WHERE id = OLD.channel_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on channel_requests
DROP TRIGGER IF EXISTS trg_update_pending_requests_count ON public.channel_requests;
CREATE TRIGGER trg_update_pending_requests_count
AFTER INSERT OR UPDATE OR DELETE ON public.channel_requests
FOR EACH ROW EXECUTE FUNCTION update_pending_requests_count();
