-- Migration: add_channel_request_notifications

-- Create the function to handle new join request notifications
CREATE OR REPLACE FUNCTION public.handle_new_join_request_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger for new pending join requests
    IF NEW.request_type = 'join_request' AND NEW.status = 'pending' THEN
        -- Insert a notification for each admin/owner of the channel
        INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id)
        SELECT cm.user_id, NEW.requested_by_id, 'channel_request', NEW.channel_id
        FROM public.channel_members cm
        WHERE cm.channel_id = NEW.channel_id AND cm.role IN ('admin', 'owner');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists to avoid duplication
DROP TRIGGER IF EXISTS on_channel_join_request_created ON public.channel_requests;

-- Create the trigger
CREATE TRIGGER on_channel_join_request_created
    AFTER INSERT ON public.channel_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_join_request_notification();
