-- ==========================================
-- CREATE BOX MEMBERS / INTERACTIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.box_members (
  box_id uuid NOT NULL REFERENCES public.boxes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_interaction_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  interaction_type text NOT NULL DEFAULT 'view', -- e.g., 'view', 'post', 'react', 'comment', 'share'
  CONSTRAINT box_members_pkey PRIMARY KEY (box_id, user_id)
);

-- Enable RLS
ALTER TABLE public.box_members ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read box members (so they can be displayed in the widget)
CREATE POLICY "Anyone can read box members" 
  ON public.box_members 
  FOR SELECT USING (true);

-- Allow users to insert their own interaction records
CREATE POLICY "Users can insert their own interactions" 
  ON public.box_members 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own interaction records
CREATE POLICY "Users can update their own interactions" 
  ON public.box_members 
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create a helper function for fast upserts bypassing client-side RLS complexity if needed
CREATE OR REPLACE FUNCTION public.track_box_interaction(
  p_box_id uuid,
  p_user_id uuid,
  p_interaction_type text
) RETURNS void AS $$
BEGIN
  -- Only allow users to track for themselves
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'You can only track interactions for your own user ID';
  END IF;

  INSERT INTO public.box_members (box_id, user_id, interaction_type, last_interaction_at)
  VALUES (p_box_id, p_user_id, p_interaction_type, timezone('utc'::text, now()))
  ON CONFLICT (box_id, user_id) 
  DO UPDATE SET 
    interaction_type = EXCLUDED.interaction_type,
    last_interaction_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
