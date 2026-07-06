import { supabase } from '@/core/supabase/supabaseConfig';

export interface AppNotification {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: string; // broadened to string to support many types
  reference_id: string | null;
  action_text?: string;
  is_read: boolean;
  created_at: string;
  
  // Joined fields
  actor?: {
    id: string;
    display_name: string;
    profile_image_url: string;
  };
}

export class NotificationRepository {
  async fetchNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:profiles!actor_id (
          id,
          display_name,
          profile_image_url
        )
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[NotificationRepository] fetchNotifications error:', error);
      throw error;
    }

    return (data || []) as AppNotification[];
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('[NotificationRepository] markAsRead error:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('[NotificationRepository] markAllAsRead error:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('[NotificationRepository] getUnreadCount error:', error);
      return 0;
    }
    return count || 0;
  }
}

export const notificationRepository = new NotificationRepository();
