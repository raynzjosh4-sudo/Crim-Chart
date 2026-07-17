-- SQL Migration to support Channel Invite Notifications and Actions

-- 1. Create a trigger to insert a notification when an invite is created
CREATE OR REPLACE FUNCTION public.handle_channel_invite_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' AND (NEW.request_type = 'admin_invite' OR NEW.request_type = 'member_invite') THEN
        INSERT INTO public.notifications (recipient_id, actor_id, type, reference_id)
        VALUES (NEW.target_user_id, NEW.requested_by_id, 'channel_invite', NEW.channel_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_channel_invite_created ON public.channel_requests;
CREATE TRIGGER on_channel_invite_created
    AFTER INSERT ON public.channel_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_channel_invite_notification();


-- 2. Create RPC to accept an invite
CREATE OR REPLACE FUNCTION public.accept_channel_invite(p_channel_id UUID, p_target_user_id UUID)
RETURNS void AS $$
DECLARE
    v_req RECORD;
    v_role TEXT;
BEGIN
    SELECT * INTO v_req FROM public.channel_requests 
    WHERE channel_id = p_channel_id AND target_user_id = p_target_user_id AND status = 'pending'
    AND (request_type = 'admin_invite' OR request_type = 'member_invite')
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invite not found or already processed';
    END IF;

    -- Update request status
    UPDATE public.channel_requests
    SET status = 'approved', updated_at = now()
    WHERE id = v_req.id;

    -- Determine role
    IF v_req.request_type = 'admin_invite' THEN
        v_role := 'admin';
    ELSE
        v_role := 'member';
    END IF;

    -- Add or update member
    INSERT INTO public.channel_members (channel_id, user_id, role)
    VALUES (v_req.channel_id, v_req.target_user_id, v_role)
    ON CONFLICT (channel_id, user_id) 
    DO UPDATE SET role = EXCLUDED.role, updated_at = now();

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Create RPC to reject an invite
CREATE OR REPLACE FUNCTION public.reject_channel_invite(p_channel_id UUID, p_target_user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.channel_requests
    SET status = 'rejected', updated_at = now()
    WHERE channel_id = p_channel_id AND target_user_id = p_target_user_id AND status = 'pending'
    AND (request_type = 'admin_invite' OR request_type = 'member_invite');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
