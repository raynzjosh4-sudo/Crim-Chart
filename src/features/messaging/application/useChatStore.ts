import { cloudMediaService } from '@/core/network/cloudMediaService';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MessageEntity, ThreadEntity, messageFromMap } from '../domain/entities/MessageEntity';

interface ChatState {
  threads: ThreadEntity[];
  messages: Record<string, MessageEntity[]>;
  isLoadingThreads: boolean;
  isLoadingMessages: Record<string, boolean>;
  typingUsers: Record<string, string[]>;
  onlineUsers: Record<string, boolean>;

  fetchThreads: () => Promise<void>;
  fetchMessages: (threadId: string, limit?: number) => Promise<void>;
  loadMoreMessages: (threadId: string, limit?: number) => Promise<void>;
  sendMessage: (threadId: string, text: string, type?: string, mediaUrl?: string) => Promise<void>;
  subscribeToThread: (threadId: string) => void;
  unsubscribeFromThread: (threadId: string) => void;
  markThreadAsRead: (threadId: string) => Promise<void>;
  subscribeToGlobalPresence: () => void;
  startTyping: (threadId: string) => void;
  stopTyping: (threadId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: [],
      messages: {},
      isLoadingThreads: false,
      isLoadingMessages: {},
      typingUsers: {},
      onlineUsers: {},

      fetchThreads: async () => {
        set({ isLoadingThreads: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not logged in');

          const { data, error } = await supabase
            .from('inbox')
            .select('*')
            .eq('user_id', user.id)
            .order('last_message_at', { ascending: false });

          if (error) throw error;

          // Fetch profiles for all participants
          const participantIds = (data || []).map((r: any) => r.participant_id).filter(Boolean);
          let profilesMap: Record<string, any> = {};
          if (participantIds.length > 0) {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, display_name, profile_image_url')
              .in('id', participantIds);

            if (profilesData) {
              profilesMap = profilesData.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
            }
          }

          const newThreads: ThreadEntity[] = (data || []).map((row: any) => {
            const pData = profilesMap[row.participant_id] || {};
            return {
              id: String(row.id),
              participants: [
                new CrimChartUserModel({
                  id: row.participant_id,
                  displayName: pData.display_name || 'User',
                  profileImageUrl: pData.profile_image_url,
                  followersCount: 0, followingCount: 0, isActive: false,
                  statusCount: 0, channelsCreatedCount: 0, channelCount: 0,
                  giftsEarned: 0, coinsEarned: 0, username: 'user', role: '',
                  isVerified: false, hasStatus: false, isFollowing: false, isMe: false
                })
              ],
              lastMessage: row.last_message ? {
                id: `last_${row.id}`,
                threadId: String(row.id),
                author: { id: row.participant_id } as any,
                createdAt: new Date(row.last_message_at),
                text: row.last_message,
                type: 'text' as any,
                status: 'sent' as any,
                isEncrypted: false,
              } : undefined,
              unreadCount: row.unread_count || 0,
              updatedAt: new Date(row.last_message_at || new Date()),
            };
          });

          set({ threads: newThreads });
        } catch (e) {
          console.error('[ChatStore] fetchThreads error:', e);
        } finally {
          set({ isLoadingThreads: false });
        }
      },

      fetchMessages: async (threadId: string, limit = 10) => {
        set(state => ({ isLoadingMessages: { ...state.isLoadingMessages, [threadId]: true } }));
        try {
          const { data: { user } } = await supabase.auth.getUser();

          const { data, error } = await supabase
            .from('inbox_messages')
            .select('*')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: false })
            .limit(limit);

          if (error) throw error;

          // Find the thread participants to map the author
          const thread = get().threads.find(t => t.id === threadId);
          const currentUser = useAuthStore.getState().user;

          // Extract all unique sender IDs that we need profiles for
          const senderIds = Array.from(new Set((data || []).map((r: any) => r.sender_id)));
          let profilesMap: Record<string, any> = {};

          if (senderIds.length > 0) {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, display_name, profile_image_url')
              .in('id', senderIds);

            if (profilesData) {
              profilesMap = profilesData.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
            }
          }

          const msgs = (data || []).map((row: any) => {
            // Find the participant in the thread that matches the sender_id
            const participant = thread?.participants.find(p => p.id === row.sender_id);
            const isMe = user ? row.sender_id === user.id : false;
            const pData = profilesMap[row.sender_id] || {};

            if (participant) {
              row.author = {
                id: participant.id,
                displayName: participant.displayName || pData.display_name || 'User',
                profileImageUrl: participant.profileImageUrl || pData.profile_image_url || '',
                isMe
              };
            } else if (isMe && currentUser) {
              row.author = {
                id: currentUser.id,
                displayName: currentUser.displayName || pData.display_name || 'You',
                profileImageUrl: currentUser.profileImageUrl || pData.profile_image_url || '',
                isMe: true
              };
            } else {
              row.author = {
                id: row.sender_id,
                displayName: pData.display_name || 'User',
                profileImageUrl: pData.profile_image_url || '',
                isMe
              };
            }

            return messageFromMap(row);
          });
          set(state => ({
            messages: { ...state.messages, [threadId]: msgs }
          }));
        } catch (e) {
          console.error('[ChatStore] fetchMessages error:', e);
        } finally {
          set(state => ({ isLoadingMessages: { ...state.isLoadingMessages, [threadId]: false } }));
        }
      },

      loadMoreMessages: async (threadId: string, limit = 10) => {
        const currentMessages = get().messages[threadId] || [];
        const offset = currentMessages.length;

        try {
          const { data: { user } } = await supabase.auth.getUser();

          const { data, error } = await supabase
            .from('inbox_messages')
            .select('*')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (error) throw error;
          if (!data || data.length === 0) return; // No more messages

          const thread = get().threads.find(t => t.id === threadId);
          const currentUser = useAuthStore.getState().user;

          const senderIds = Array.from(new Set(data.map((r: any) => r.sender_id)));
          let profilesMap: Record<string, any> = {};

          if (senderIds.length > 0) {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, display_name, profile_image_url')
              .in('id', senderIds);

            if (profilesData) {
              profilesMap = profilesData.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
            }
          }

          const msgs = data.map((row: any) => {
            const participant = thread?.participants.find(p => p.id === row.sender_id);
            const isMe = user ? row.sender_id === user.id : false;
            const pData = profilesMap[row.sender_id] || {};

            if (participant) {
              row.author = {
                id: participant.id,
                displayName: participant.displayName || pData.display_name || 'User',
                profileImageUrl: participant.profileImageUrl || pData.profile_image_url || '',
                isMe
              };
            } else if (isMe && currentUser) {
              row.author = {
                id: currentUser.id,
                displayName: currentUser.displayName || pData.display_name || 'You',
                profileImageUrl: currentUser.profileImageUrl || pData.profile_image_url || '',
                isMe: true
              };
            } else {
              row.author = {
                id: row.sender_id,
                displayName: pData.display_name || 'User',
                profileImageUrl: pData.profile_image_url || '',
                isMe
              };
            }

            return messageFromMap(row);
          });

          set(state => {
            const existingIds = new Set((state.messages[threadId] || []).map(m => m.id));
            const filteredMsgs = msgs.filter(m => !existingIds.has(m.id));
            return {
              messages: { ...state.messages, [threadId]: [...(state.messages[threadId] || []), ...filteredMsgs] }
            };
          });
        } catch (e) {
          console.error('[ChatStore] loadMoreMessages error:', e);
        }
      },

      sendMessage: async (threadId, text, type = 'text', mediaUrl) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not logged in');

          // Random ID for the message since the schema requires text ID
          const messageId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7);

          const currentUser = useAuthStore.getState().user;
          const optimisticMsg = messageFromMap({
            id: messageId,
            thread_id: threadId,
            sender_id: user.id,
            body: text,
            message_type: type,
            media_url: mediaUrl,
            created_at: new Date().toISOString(),
            isRead: false,
            author: {
              id: user.id,
              displayName: currentUser?.displayName || currentUser?.username || 'Me',
              profileImageUrl: currentUser?.profileImageUrl || '',
              isMe: true
            }
          });

          // Update state optimistically
          set(state => {
            const threadMsgs = state.messages[threadId] || [];
            return {
              messages: { ...state.messages, [threadId]: [optimisticMsg, ...threadMsgs] }
            };
          });

          // Process media uploads
          let finalMediaUrl = mediaUrl;

          if (mediaUrl && type !== 'lottie') {
            try {
              // Check if it's a JSON array
              const parsed = JSON.parse(mediaUrl);
              if (Array.isArray(parsed)) {
                const uploadedUrls: string[] = [];
                for (const p of parsed) {
                  if (p.startsWith('file://') || p.startsWith('/')) {
                    const url = await cloudMediaService.uploadMedia(p, 'inbox_media', user.id);
                    uploadedUrls.push(url);
                  } else {
                    uploadedUrls.push(p);
                  }
                }
                finalMediaUrl = JSON.stringify(uploadedUrls);
              }
            } catch (e) {
              // Not a JSON array, check if single file path
              if (mediaUrl.startsWith('file://') || mediaUrl.startsWith('/')) {
                finalMediaUrl = await cloudMediaService.uploadMedia(mediaUrl, 'inbox_media', user.id);
              }
            }
          }

          const { data, error } = await supabase
            .from('inbox_messages')
            .insert({
              id: messageId,
              thread_id: threadId,
              sender_id: user.id,
              body: text,
              message_type: type,
              media_url: finalMediaUrl,
              isRead: false
            })
            .select()
            .single();

          if (error) {
            // Revert on error
            set(state => {
              const threadMsgs = state.messages[threadId] || [];
              return {
                messages: { ...state.messages, [threadId]: threadMsgs.filter(m => m.id !== messageId) }
              };
            });
            throw error;
          }

          const confirmedMsg = messageFromMap(data);
          // Ensure the author block is kept correctly for the confirmed message
          confirmedMsg.author = { id: user.id, displayName: currentUser?.displayName || currentUser?.username || 'Me', profileImageUrl: currentUser?.profileImageUrl || '', isMe: true } as any;

          set(state => {
            const threadMsgs = state.messages[threadId] || [];
            return {
              messages: { ...state.messages, [threadId]: threadMsgs.map(m => m.id === messageId ? confirmedMsg : m) }
            };
          });
        } catch (e) {
          console.error('[ChatStore] sendMessage error:', e);
        }
      },

      subscribeToThread: (threadId: string) => {
        const channel = supabase.channel(`chat_${threadId}`);

        channel
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'inbox_messages', filter: `thread_id=eq.${threadId}` },
            async (payload) => {
              const { data: { user } } = await supabase.auth.getUser();
              const newMsg = messageFromMap(payload.new);
              const isMe = user ? payload.new.sender_id === user.id : false;

              const currentUser = useAuthStore.getState().user;
              newMsg.author = {
                id: payload.new.sender_id,
                isMe,
                displayName: isMe ? (currentUser?.displayName || currentUser?.username || 'Me') : 'User',
                profileImageUrl: isMe ? (currentUser?.profileImageUrl || '') : ''
              } as any;

              set(state => {
                const currentMsgs = state.messages[threadId] || [];
                if (currentMsgs.some(m => m.id === newMsg.id)) return state;
                return { messages: { ...state.messages, [threadId]: [newMsg, ...currentMsgs] } };
              });
            }
          )
          .on('broadcast', { event: 'typing' }, ({ payload }) => {
            set(state => {
              const currentTyping = state.typingUsers[threadId] || [];
              let newTyping = [...currentTyping];

              if (payload.isTyping && !newTyping.includes(payload.userId)) {
                newTyping.push(payload.userId);
              } else if (!payload.isTyping) {
                newTyping = newTyping.filter(id => id !== payload.userId);
              }

              return { typingUsers: { ...state.typingUsers, [threadId]: newTyping } };
            });
          })
          .subscribe();
      },

      unsubscribeFromThread: (threadId: string) => {
        supabase.removeChannel(supabase.channel(`chat_${threadId}`));
      },

      startTyping: async (threadId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        supabase.channel(`chat_${threadId}`).send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: user.id, isTyping: true }
        });
      },

      stopTyping: async (threadId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        supabase.channel(`chat_${threadId}`).send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: user.id, isTyping: false }
        });
      },

      markThreadAsRead: async (threadId: string) => {
        try {
          const { error } = await supabase
            .from('inbox')
            .update({ unread_count: 0 })
            .eq('id', threadId);

          if (error) throw error;

          set(state => ({
            threads: state.threads.map(t =>
              t.id === threadId ? { ...t, unreadCount: 0 } : t
            )
          }));
        } catch (e) {
          console.error('[ChatStore] markThreadAsRead error:', e);
        }
      },

      subscribeToGlobalPresence: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const presenceChannel = supabase.channel('global_presence');
        presenceChannel
          .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState();
            const onlineUsersMap: Record<string, boolean> = {};
            for (const key in state) {
              const userPresences = state[key] as any[];
              if (userPresences && userPresences.length > 0) {
                onlineUsersMap[userPresences[0].userId] = true;
              }
            }
            set({ onlineUsers: onlineUsersMap });
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await presenceChannel.track({
                userId: user.id,
                onlineAt: new Date().toISOString(),
              });
            }
          });
      }
    })
    ,
    {
      name: 'crimchart-chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ threads: state.threads, messages: state.messages }),
    }
  )
);
