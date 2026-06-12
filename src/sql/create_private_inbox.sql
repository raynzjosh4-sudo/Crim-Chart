CREATE OR REPLACE FUNCTION create_private_inbox(target_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_thread_id UUID;
  existing_thread_id UUID;
BEGIN
  -- First check if it already exists
  SELECT id INTO existing_thread_id
  FROM inbox
  WHERE user_id = auth.uid()
    AND participant_id = target_user_id
    AND chat_type = 'private'
  LIMIT 1;

  IF existing_thread_id IS NOT NULL THEN
    RETURN existing_thread_id;
  END IF;

  -- Generate a new thread ID
  new_thread_id := gen_random_uuid();

  -- Insert for current user
  INSERT INTO inbox (id, user_id, participant_id, chat_type, unread_count)
  VALUES (new_thread_id, auth.uid(), target_user_id, 'private', 0);

  -- Insert for target user
  INSERT INTO inbox (id, user_id, participant_id, chat_type, unread_count)
  VALUES (new_thread_id, target_user_id, auth.uid(), 'private', 0);

  RETURN new_thread_id;
END;
$$;
