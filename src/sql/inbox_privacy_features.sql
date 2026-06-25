-- 1. Create accept_private_inbox RPC
CREATE OR REPLACE FUNCTION accept_private_inbox(target_thread_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the status of both rows matching the thread ID to 'accepted'
  -- The user accepting it must be one of the participants
  UPDATE inbox
  SET status = 'accepted'
  WHERE id = target_thread_id
    AND (user_id = auth.uid() OR participant_id = auth.uid());

  RETURN TRUE;
END;
$$;

-- 2. Add locked_intent to user_connection_stats
ALTER TABLE public.user_connection_stats
ADD COLUMN IF NOT EXISTS locked_intent boolean DEFAULT false;

-- 3. Create a simple blocked_users table to track blocking
CREATE TABLE IF NOT EXISTS public.blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- Turn on Row Level Security
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Blockers can see their blocks, blocked users can also see they are blocked (to hide UI)
CREATE POLICY "Users can read their own blocks or blocks against them"
ON public.blocked_users FOR SELECT USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

CREATE POLICY "Users can block others"
ON public.blocked_users FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others"
ON public.blocked_users FOR DELETE USING (auth.uid() = blocker_id);

-- 4. Create an RPC to check privacy status for an inbox
CREATE OR REPLACE FUNCTION check_inbox_privacy(target_user_id UUID)
RETURNS TABLE (
  is_blocked BOOLEAN,
  is_locked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  blocked_count INT;
  locked_status BOOLEAN;
BEGIN
  -- Check if the target user has blocked the current user
  SELECT COUNT(*) INTO blocked_count
  FROM blocked_users
  WHERE blocker_id = target_user_id AND blocked_id = auth.uid();

  -- Check if the target user has locked their intent
  SELECT locked_intent INTO locked_status
  FROM user_connection_stats
  WHERE user_id = target_user_id;

  RETURN QUERY SELECT (blocked_count > 0), COALESCE(locked_status, false);
END;
$$;
