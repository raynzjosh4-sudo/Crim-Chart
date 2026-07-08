-- Migration: handle_request_approval

-- Create the function to automatically add users to channel_members when a request is approved
CREATE OR REPLACE FUNCTION public.handle_channel_request_approved()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        IF NEW.request_type IN ('join_request', 'member_invite', 'admin_invite') THEN
            INSERT INTO public.channel_members (channel_id, user_id, role)
            VALUES (
                NEW.channel_id, 
                NEW.target_user_id, 
                CASE WHEN NEW.request_type = 'admin_invite' THEN 'admin' ELSE 'member' END
            )
            ON CONFLICT (channel_id, user_id) DO UPDATE SET role = EXCLUDED.role;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS on_channel_request_approved ON public.channel_requests;

-- Create the trigger
CREATE TRIGGER on_channel_request_approved
    AFTER UPDATE ON public.channel_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_channel_request_approved();
