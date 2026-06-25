import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export function useChannelBroadcast(channelId: string | undefined, onMessageReceived: (payload: any) => void) {
  const [typingUsers, setTypingUsers] = useState<Record<string, any>>({});
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [channelInstance, setChannelInstance] = useState<any>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!channelId || !supabase?.channel) return;

    const channelName = `channel_${channelId}`;

    // Remove any lingering channel to prevent "cannot add callbacks after subscribe" error
    const existingChannels = supabase.getChannels().filter(c => c.topic === `realtime:${channelName}`);
    existingChannels.forEach(c => supabase.removeChannel(c));

    // Create a Supabase channel for this specific chat
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false },
        presence: { key: user?.id || `anon_${Date.now()}` },
      },
    });

    // Listen for broadcast messages
    channel.on('broadcast', { event: 'new_message' }, (payload) => {
      onMessageReceived(payload.payload);
    });

    // Listen for presence state (typing indicators and online status)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const currentTyping: Record<string, any> = {};
      const currentActive: any[] = [];
      
      for (const id in state) {
        const presenceList = state[id] as any[];
        if (presenceList.length > 0) {
          const presenceData = presenceList[0];
          
          if (presenceData.user) {
            currentActive.push({
              ...presenceData.user,
              profileImageUrl: presenceData.user.profileImageUrl || presenceData.user.profile_image_url || 'https://i.pravatar.cc/150?img=12',
              username: presenceData.user.displayName || presenceData.user.username || 'User',
              isTyping: presenceData.isTyping || false,
              isOnline: true
            });
          }

          // Track typing explicitly
          if (presenceData.isTyping && id !== user?.id) {
            currentTyping[id] = presenceData.user;
          }
        }
      }
      setTypingUsers(currentTyping);
      setActiveUsers(currentActive);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setChannelInstance(channel);
        const plainUser = user ? {
          id: user.id,
          displayName: user.displayName,
          username: user.username,
          profileImageUrl: user.profileImageUrl
        } : null;
        await channel.track({ isTyping: false, user: plainUser });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, user]);

  const broadcastMessage = useCallback(
    async (message: any) => {
      if (channelInstance) {
        console.log('[Pipeline Step 2.5] WebSocket: Payload sent successfully over Supabase Realtime');
        await channelInstance.send({
          type: 'broadcast',
          event: 'new_message',
          payload: message,
        });
      }
    },
    [channelInstance]
  );

  const broadcastTyping = useCallback(
    async (isTyping: boolean) => {
      if (channelInstance) {
        const plainUser = user ? {
          id: user.id,
          displayName: user.displayName,
          username: user.username,
          profileImageUrl: user.profileImageUrl
        } : null;
        await channelInstance.track({ isTyping, user: plainUser });
      }
    },
    [channelInstance, user]
  );

  return { broadcastMessage, broadcastTyping, typingUsers, activeUsers };
}
