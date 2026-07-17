-- Drop existing policies that might conflict, or just add a new comprehensive one
-- We create a policy that allows channel creator OR any member with role 'admin' or 'owner' to update the channel

DROP POLICY IF EXISTS "Allow channel creators to update channel" ON public.channels;
DROP POLICY IF EXISTS "Allow admins to update channel settings" ON public.channels;

CREATE POLICY "Allow admins and creators to update channel settings" 
ON public.channels
FOR UPDATE
USING (
  auth.uid() = creator_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.channel_members cm
    WHERE cm.channel_id = id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'owner')
  )
);
