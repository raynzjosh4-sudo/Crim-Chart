import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useChannelBroadcast(channelId: string | undefined, onMessageReceived: (payload: any) => void) {
  const [typingUsers, setTypingUsers] = useState<Record<string, any>>({});
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [channelInstance, setChannelInstance] = useState<any>(null);
  const user = useAuthStore((s) => s.user);
  const connectionIdRef = useRef(`conn_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`);
  // Use a ref so broadcastTyping always has the latest channel without stale closures
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!channelId || !supabase?.channel) return;

    const channelName = `channel_${channelId}`;
    console.log('[Typing Debug] Setting up channel:', channelName, 'connId:', connectionIdRef.current);

    // Remove any lingering channel to prevent "cannot add callbacks after subscribe" error
    const existingChannels = supabase.getChannels().filter(c => c.topic === channelName || c.topic === `realtime:${channelName}`);
    existingChannels.forEach(c => supabase.removeChannel(c));

    // Create a Supabase channel for this specific chat
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false },
        presence: { key: connectionIdRef.current },
      },
    });

    // Listen for broadcast messages
    channel.on('broadcast', { event: 'new_message' }, (payload) => {
      onMessageReceived(payload.payload);
    });

    // Listen for presence state (typing indicators and online status)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('[Typing Debug] Presence sync fired. State keys:', Object.keys(state));
      const currentTyping: Record<string, any> = {};
      const uniqueActive = new Map<string, any>();
      
      for (const id in state) {
        const presenceList = state[id] as any[];
        if (presenceList.length > 0) {
          // Sort by updatedAt descending to get the most recent state (fixes ghost channel issues)
          const sortedList = [...presenceList].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          const presenceData = sortedList[0];
          console.log('[Typing Debug] Presence entry:', id, 'listLength:', presenceList.length, 'isTyping:', presenceData.isTyping, 'myConnId:', connectionIdRef.current);
          
          if (presenceData.user) {
            uniqueActive.set(presenceData.user.id, {
              ...presenceData.user,
              profileImageUrl: presenceData.user.profileImageUrl || presenceData.user.profile_image_url || 'https://i.pravatar.cc/150?img=12',
              username: presenceData.user.displayName || presenceData.user.username || 'User',
              isTyping: presenceData.isTyping || false,
              isOnline: true
            });
          }

          // Track typing — exclude our own connection
          if (presenceData.isTyping && id !== connectionIdRef.current) {
            console.log('[Typing Debug] Someone is typing:', presenceData.user?.displayName);
            currentTyping[id] = presenceData.user;
          }
        }
      }
      setTypingUsers(currentTyping);
      setActiveUsers(Array.from(uniqueActive.values()));
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }: { key: string; newPresences: any[] }) => {
      console.log('[Typing Debug] Presence JOIN:', key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string; leftPresences: any[] }) => {
      console.log('[Typing Debug] Presence LEAVE:', key, leftPresences);
    });

    channel.subscribe(async (status: string) => {
      console.log('[Typing Debug] Subscribe status:', status);
      if (status === 'SUBSCRIBED') {
        channelRef.current = channel;
        setChannelInstance(channel);
        const plainUser = user ? {
          id: user.id,
          displayName: user.displayName,
          username: user.username,
          profileImageUrl: user.profileImageUrl
        } : null;
        console.log('[Typing Debug] Tracking initial presence for user:', plainUser?.displayName);
        await channel.track({ isTyping: false, user: plainUser });
      }
    });

    return () => {
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [channelId, user?.id]);

  const broadcastMessage = useCallback(
    async (message: any) => {
      const ch = channelRef.current;
      if (ch) {
        console.log('[Pipeline Step 2.5] WebSocket: Payload sent successfully over Supabase Realtime');
        await ch.send({
          type: 'broadcast',
          event: 'new_message',
          payload: message,
        });
      }
    },
    []
  );

    const broadcastTyping = useCallback(
    async (isTyping: boolean) => {
      const ch = channelRef.current;
      console.log('[Typing Debug] broadcastTyping called:', isTyping, 'channel ready:', !!ch);
      if (ch) {
        const plainUser = user ? {
          id: user.id,
          displayName: user.displayName,
          username: user.username,
          profileImageUrl: user.profileImageUrl
        } : null;
        await ch.track({ isTyping, user: plainUser, updatedAt: Date.now() });
      }
    },
    [user]
  );

  return { broadcastMessage, broadcastTyping, typingUsers, activeUsers };
}
