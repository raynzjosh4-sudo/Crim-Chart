-- Note: You can either run this script OR use the Supabase Dashboard UI 
-- (Database -> Webhooks -> Create Webhook) which is usually easier!

-- 1. Create the webhook function
CREATE OR REPLACE FUNCTION public.trigger_push_notification_webhook()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/push-notification';
  anon_key TEXT := 'YOUR_ANON_KEY';
  payload JSONB;
  request_id BIGINT;
BEGIN
  -- Package the new notification row as JSON
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'notifications',
    'record', row_to_json(NEW)
  );

  -- Use pg_net to make an asynchronous POST request to the Edge Function
  SELECT net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      ),
      body := payload
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to the notifications table
DROP TRIGGER IF EXISTS on_notification_created_webhook ON public.notifications;
CREATE TRIGGER on_notification_created_webhook
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.trigger_push_notification_webhook();
