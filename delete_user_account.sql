-- Function to allow a user to delete their own account
-- This function is SECURITY DEFINER so it can bypass RLS to delete from auth.users

CREATE OR REPLACE FUNCTION delete_own_account(confirmation_text TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid uuid;
BEGIN
  -- Get the current authenticated user ID
  v_uid := auth.uid();

  -- Verify the confirmation text exactly matches
  IF confirmation_text != 'delete my account' THEN
    RAISE EXCEPTION 'Invalid confirmation text. Must be exactly "delete my account"';
  END IF;

  -- Ensure user is logged in
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from auth.users.
  -- Depending on foreign key constraints (e.g. ON DELETE CASCADE) this will also
  -- delete their profile, posts, etc. If cascade is not configured, additional
  -- DELETE statements for public tables should be added here.
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;
