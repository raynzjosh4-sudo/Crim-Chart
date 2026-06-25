-- Step 1: Database Foundation for Connection Intent

-- 1. Add privacy settings to the profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS inbox_permission text DEFAULT 'everyone' CHECK (inbox_permission IN ('everyone', 'require_approval', 'followers_only', 'only_me'));

-- 2. Create the user_connection_stats table
CREATE TABLE IF NOT EXISTS public.user_connection_stats (
    -- Links directly to the user profile
    user_id uuid REFERENCES public.profiles(id) PRIMARY KEY,
    
    -- The Auto-Updating Tally Data
    rel_sent_count int DEFAULT 0,
    rel_accepted_count int DEFAULT 0,
    
    -- The Calculated Preferences
    relationship_status text DEFAULT 'Unknown',
    preferred_countries text[] DEFAULT '{}',
    preferred_age_ranges text[] DEFAULT '{}',
    
    -- Granular Privacy Settings
    show_status_circle boolean DEFAULT true,
    show_status_text boolean DEFAULT true,
    show_country_pref boolean DEFAULT true,
    show_age_pref boolean DEFAULT true
);

-- Turn on Row Level Security
ALTER TABLE public.user_connection_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the stats
CREATE POLICY "Anyone can read connection stats" 
ON public.user_connection_stats FOR SELECT USING (true);

-- Users can only update their own privacy settings
CREATE POLICY "Users can update their own privacy" 
ON public.user_connection_stats FOR UPDATE USING (auth.uid() = user_id);

-- 3. Create a trigger function to auto-insert a stats row when a new profile is created
CREATE OR REPLACE FUNCTION public.create_default_connection_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_connection_stats (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Attach the trigger to the profiles table
DROP TRIGGER IF EXISTS on_profile_created_stats ON public.profiles;
CREATE TRIGGER on_profile_created_stats
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.create_default_connection_stats();

-- 5. Backfill the user_connection_stats for existing profiles
INSERT INTO public.user_connection_stats (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;
