-- Step 4: UI/UX Implementation Database Updates

CREATE OR REPLACE FUNCTION create_private_inbox(target_user_id UUID, intent_type TEXT DEFAULT 'friendship')
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

  -- Insert for current user (they are the initiator)
  INSERT INTO inbox (id, user_id, participant_id, chat_type, unread_count, connection_intent, status, initiated_by)
  VALUES (new_thread_id, auth.uid(), target_user_id, 'private', 0, intent_type, 'pending', auth.uid());

  -- Insert for target user (they are the receiver)
  INSERT INTO inbox (id, user_id, participant_id, chat_type, unread_count, connection_intent, status, initiated_by)
  VALUES (new_thread_id, target_user_id, auth.uid(), 'private', 0, intent_type, 'pending', auth.uid());

  RETURN new_thread_id;
END;
$$;
