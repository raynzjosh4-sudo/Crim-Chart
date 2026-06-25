-- Enable RLS on the profiles table if it's not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it exists to avoid errors on reruns
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create policy allowing users to insert a row where the id matches their auth.uid()
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Ensure users can also update their own profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Ensure everyone can view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);
