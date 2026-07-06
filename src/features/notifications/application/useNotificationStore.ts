import { create } from 'zustand';
import { AppNotification, notificationRepository } from '../data/NotificationRepository';
import { supabase } from '@/core/supabase/supabaseConfig';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  
  // Actions
  fetchNotifications: (userId: string, refresh?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  subscribeToNotifications: (userId: string) => void;
  unsubscribe: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: true,

  fetchNotifications: async (userId: string, refresh: boolean = false) => {
    if (get().isLoading) return;
    
    set({ isLoading: true });
    try {
      const currentNotifications = refresh ? [] : get().notifications;
      const offset = currentNotifications.length;
      const limit = 20;

      const [newNotifications, unreadCount] = await Promise.all([
        notificationRepository.fetchNotifications(userId, limit, offset),
        notificationRepository.getUnreadCount(userId)
      ]);

      set({
        notifications: refresh ? newNotifications : [...currentNotifications, ...newNotifications],
        unreadCount,
        hasMore: newNotifications.length === limit,
        isLoading: false
      });
    } catch (e) {
      console.error('[useNotificationStore] fetchNotifications error:', e);
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await notificationRepository.markAsRead(notificationId);
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (e) {
      console.error('[useNotificationStore] markAsRead error:', e);
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      await notificationRepository.markAllAsRead(userId);
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
      }));
    } catch (e) {
      console.error('[useNotificationStore] markAllAsRead error:', e);
    }
  },

  subscribeToNotifications: (userId: string) => {
    // Unsubscribe from any existing subscription first
    get().unsubscribe();

    const channel = supabase.channel(`public:notifications:recipient_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        async (payload) => {
          // A new notification came in. Let's refresh the whole list for simplicity to get joined actor info,
          // or we could selectively fetch just the new one. Since notifications aren't extremely high frequency,
          // a simple refresh works well.
          await get().fetchNotifications(userId, true);
        }
      )
      .subscribe();
      
    // Store channel reference (hacky way since we can't easily put it in Zustand state without non-serializable warning, 
    // but it's fine for simple app lifecycle)
    (globalThis as any).__notificationSubscription = channel;
  },

  unsubscribe: () => {
    const channel = (globalThis as any).__notificationSubscription;
    if (channel) {
      supabase.removeChannel(channel);
      (globalThis as any).__notificationSubscription = null;
    }
  }
}));
