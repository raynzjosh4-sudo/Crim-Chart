import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { NotificationPayload } from './NotificationTypes';

export function useNotificationWrapper() {
  const { user } = useAuthStore();

  const sendNotification = async (payload: NotificationPayload) => {
    if (!user?.id) {
      console.warn('[useNotificationWrapper] Cannot send notification: No user logged in.');
      return { error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          recipient_id: payload.recipientId,
          actor_id: user.id,
          type: payload.type,
          reference_id: payload.referenceId || null,
        });

      if (error) {
        console.error('[useNotificationWrapper] Failed to trigger notification:', error);
        return { error };
      }

      console.log('[useNotificationWrapper] Notification successfully triggered!');
      return { data };
    } catch (err) {
      console.error('[useNotificationWrapper] Exception while triggering notification:', err);
      return { error: err };
    }
  };

  return { sendNotification };
}
