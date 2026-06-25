-- Create the unified channel_requests table
CREATE TABLE IF NOT EXISTS public.channel_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('admin_invite', 'member_invite', 'join_request', 'leave_request')),
    requested_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'canceled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure a user can only have one pending request of a specific type per channel
CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_request_idx 
ON public.channel_requests(channel_id, target_user_id, request_type) 
WHERE status = 'pending';

-- Enable Row Level Security
ALTER TABLE public.channel_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view requests targeted at them or created by them
CREATE POLICY "Users can view their own requests"
ON public.channel_requests
FOR SELECT
USING (auth.uid() = target_user_id OR auth.uid() = requested_by_id);

-- Policy: Channel Owners/Admins can view all requests for their channel
CREATE POLICY "Admins can view channel requests"
ON public.channel_requests
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.channel_members cm
        WHERE cm.channel_id = channel_requests.channel_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('admin', 'owner')
    )
);

-- Policy: Users can insert join_requests for themselves
CREATE POLICY "Users can create join requests"
ON public.channel_requests
FOR INSERT
WITH CHECK (
    auth.uid() = requested_by_id AND 
    auth.uid() = target_user_id AND 
    request_type = 'join_request'
);

-- Policy: Admins can insert admin_invite and member_invite requests
CREATE POLICY "Admins can create invites"
ON public.channel_requests
FOR INSERT
WITH CHECK (
    auth.uid() = requested_by_id AND 
    request_type IN ('admin_invite', 'member_invite') AND
    EXISTS (
        SELECT 1 FROM public.channel_members cm
        WHERE cm.channel_id = channel_requests.channel_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('admin', 'owner')
    )
);

-- Policy: Target users can update their own requests (e.g. to accept/reject an invite)
CREATE POLICY "Users can update their received invites"
ON public.channel_requests
FOR UPDATE
USING (auth.uid() = target_user_id);

-- Policy: Admins can update requests for their channel (e.g. approve/reject join requests)
CREATE POLICY "Admins can update channel requests"
ON public.channel_requests
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.channel_members cm
        WHERE cm.channel_id = channel_requests.channel_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('admin', 'owner')
    )
);
