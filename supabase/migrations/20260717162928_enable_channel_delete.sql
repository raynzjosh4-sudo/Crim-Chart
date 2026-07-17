DROP POLICY IF EXISTS "Users can delete their own channels" ON public.channels;
CREATE POLICY "Users can delete their own channels" ON public.channels FOR DELETE USING (auth.uid() = creator_id);
