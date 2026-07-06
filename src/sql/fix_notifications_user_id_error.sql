-- Fix for the "record 'new' has no field 'user_id'" error

-- 1. Drop ALL existing policies on public.notifications to clear any old dangling policies that reference user_id
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'notifications'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications;', pol.policyname);
    END LOOP;
END
$$;

-- 2. Drop ALL existing triggers on public.notifications to clear any old dangling triggers
DO $$
DECLARE
    trig record;
BEGIN
    FOR trig IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_schema = 'public' AND event_object_table = 'notifications'
          -- keep system triggers starting with 'RI_ConstraintTrigger' safe
          AND trigger_name NOT LIKE 'RI_%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.notifications;', trig.trigger_name);
    END LOOP;
END
$$;

-- 3. Re-apply the correct RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications (e.g., mark as read)"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = recipient_id);

CREATE POLICY "System can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = recipient_id);

-- 4. Re-apply the correct Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Done!
