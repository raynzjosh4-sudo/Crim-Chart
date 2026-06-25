-- 1. Create a function that automatically inserts a profile for every new auth.users row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username text;
  final_username text;
BEGIN
  -- Generate a base username from email or metadata
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'user'
  );
  
  -- Clean up the username (remove spaces, etc)
  base_username := regexp_replace(base_username, '\s+', '', 'g');
  
  -- Append a random number to ensure uniqueness
  final_username := base_username || '_' || floor(random() * 10000)::text;

  -- Insert into public.profiles
  INSERT INTO public.profiles (
    id,
    display_name,
    username,
    profile_image_url
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'User'),
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
