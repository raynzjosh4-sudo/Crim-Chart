-- Step 2: Inbox & Trigger Architecture for Connection Intent

-- 1. Add connection intent and status to the inbox table
ALTER TABLE public.inbox
ADD COLUMN IF NOT EXISTS connection_intent text CHECK (connection_intent IN ('friendship', 'relationship', 'business', 'family', 'other')),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
ADD COLUMN IF NOT EXISTS initiated_by uuid REFERENCES public.profiles(id);

-- 2. Create the Auto-Counter Function
CREATE OR REPLACE FUNCTION public.update_relationship_tallies()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process relationship intents
    IF NEW.connection_intent != 'relationship' THEN
        RETURN NEW;
    END IF;

    -- If a new relationship thread is created, add +1 to the sender's profile
    -- We check NEW.user_id = NEW.initiated_by to ensure we only count it once (in case of mirrored inbox rows)
    IF TG_OP = 'INSERT' AND NEW.user_id = NEW.initiated_by THEN
        UPDATE public.user_connection_stats 
        SET rel_sent_count = COALESCE(rel_sent_count, 0) + 1 
        WHERE user_id = NEW.user_id;
    END IF;

    -- If a relationship thread status changes to 'accepted', add +1 to the receiver's profile
    -- The receiver is the one where user_id != initiated_by
    IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' AND NEW.user_id != NEW.initiated_by THEN
        UPDATE public.user_connection_stats 
        SET rel_accepted_count = COALESCE(rel_accepted_count, 0) + 1 
        WHERE user_id = NEW.user_id;

        -- We will add demographic aggregation logic (preferred_countries, preferred_age_ranges) here in the future
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach it to your Inbox table
DROP TRIGGER IF EXISTS on_inbox_activity ON public.inbox;
CREATE TRIGGER on_inbox_activity
AFTER INSERT OR UPDATE ON public.inbox
FOR EACH ROW EXECUTE FUNCTION public.update_relationship_tallies();
