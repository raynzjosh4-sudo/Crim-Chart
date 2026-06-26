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
  loadMoreThreads: () => Promise<void>;
  fetchMessages: (threadId: string, limit?: number) => Promise<void>;
  loadMoreMessages: (threadId: string, limit?: number) => Promise<void>;
  sendMessage: (threadId: string, text: string, type?: string, mediaUrl?: string) => Promise<void>;
  subscribeToThread: (threadId: string) => void;
  unsubscribeFromThread: (threadId: string) => void;
  markThreadAsRead: (threadId: string) => Promise<void>;
  acceptInboxRequest: (threadId: string) => Promise<void>;
  checkInboxPrivacy: (participantId: string) => Promise<{ isBlocked: boolean, isLocked: boolean }>;
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
            .order('last_message_at', { ascending: false })
            .limit(10);

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
            console.log(`[DEBUG INBOX] Thread ${row.id} - DB text: "${row.last_message}", DB type: "${row.last_message_type}"`);

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
              lastMessage: row.last_message_at ? {
                id: `last_${row.id}`,
                threadId: String(row.id),
                author: { id: row.participant_id } as any,
                createdAt: new Date(row.last_message_at),
                text: row.last_message || '',
                type: (row.last_message_type || 'text') as any,
                status: 'sent' as any,
                isEncrypted: false,
              } : undefined,
              unreadCount: row.unread_count || 0,
              updatedAt: new Date(row.last_message_at || new Date()),
              intent: row.connection_intent,
              status: row.status,
              initiatedBy: row.initiated_by,
            };
          });

          set({ threads: newThreads });

          // Background prefetch for the top 10 recent threads to ensure zero wait time
          newThreads.slice(0, 10).forEach(thread => {
            get().fetchMessages(thread.id, 10);
          });
        } catch (e) {
          console.error('[ChatStore] fetchThreads error:', e);
        } finally {
          set({ isLoadingThreads: false });
        }
      },

      loadMoreThreads: async () => {
        const currentThreads = get().threads;
        if (currentThreads.length === 0) return;
        const offset = currentThreads.length;

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not logged in');

          const { data, error } = await supabase
            .from('inbox')
            .select('*')
            .eq('user_id', user.id)
            .order('last_message_at', { ascending: false })
            .range(offset, offset + 9);

          if (error) throw error;
          if (!data || data.length === 0) return;

          const participantIds = data.map((r: any) => r.participant_id).filter(Boolean);
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

          const newThreads: ThreadEntity[] = data.map((row: any) => {
            const pData = profilesMap[row.participant_id] || {};
            return {
              id: String(row.id),
              participants: [
                {
                  id: row.participant_id,
                  displayName: pData.display_name || 'User',
                  profileImageUrl: pData.profile_image_url,
                  followersCount: 0, followingCount: 0, isActive: false,
                  statusCount: 0, channelsCreatedCount: 0, channelCount: 0,
                  giftsEarned: 0, coinsEarned: 0, username: 'user', role: '',
                  isVerified: false, hasStatus: false, isFollowing: false, isMe: false
                } as any
              ],
              lastMessage: row.last_message_at ? {
                id: `last_${row.id}`,
                threadId: String(row.id),
                author: { id: row.participant_id } as any,
                createdAt: new Date(row.last_message_at),
                text: row.last_message || '',
                type: (row.last_message_type || 'text') as any,
                status: 'sent' as any,
                isEncrypted: false,
              } : undefined,
              unreadCount: row.unread_count || 0,
              updatedAt: new Date(row.last_message_at || new Date()),
            };
          });

          const existingIds = new Set(currentThreads.map(t => t.id));
          const filteredNewThreads = newThreads.filter(t => !existingIds.has(t.id));

          set({ threads: [...currentThreads, ...filteredNewThreads] });
        } catch (e) {
          console.error('[ChatStore] loadMoreThreads error:', e);
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
            const updatedThreads = state.threads.map(t => {
              if (t.id === threadId) {
                return {
                  ...t,
                  lastMessage: optimisticMsg,
                  updatedAt: new Date(),
                };
              }
              return t;
            });

            // Sort threads so the most recently updated is at the top
            updatedThreads.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

            return {
              messages: { ...state.messages, [threadId]: [optimisticMsg, ...threadMsgs] },
              threads: updatedThreads
            };
          });

          let finalMediaUrl = mediaUrl;

          if (mediaUrl && type !== 'lottie') {
            try {
              // Check if it's a JSON array
              const parsed = JSON.parse(mediaUrl);
              if (Array.isArray(parsed)) {
                const uploadedUrls: any[] = [];
                for (const p of parsed) {
                  let urlStr = typeof p === 'string' ? p : p.uri;
                  let thumbStr = typeof p === 'string' ? undefined : p.thumbnail;
                  let itemType = typeof p === 'string' ? 'image' : p.type;

                  if (urlStr.startsWith('file://') || urlStr.startsWith('/') || urlStr.startsWith('content://') || urlStr.startsWith('blob:')) {
                    urlStr = await cloudMediaService.uploadMedia(urlStr, 'inbox_media', user.id);
                  }

                  if (thumbStr && (thumbStr.startsWith('file://') || thumbStr.startsWith('/') || thumbStr.startsWith('content://') || thumbStr.startsWith('blob:'))) {
                    thumbStr = await cloudMediaService.uploadMedia(thumbStr, 'inbox_media', user.id);
                  }

                  if (typeof p === 'string') {
                    uploadedUrls.push(urlStr);
                  } else {
                    uploadedUrls.push({ url: urlStr, thumbnail: thumbStr, type: itemType });
                  }
                }
                finalMediaUrl = JSON.stringify(uploadedUrls);
              }
            } catch (e) {
              // Not a JSON array, check if single file path
              if (mediaUrl.startsWith('file://') || mediaUrl.startsWith('/') || mediaUrl.startsWith('content://') || mediaUrl.startsWith('blob:')) {
                try {
                  finalMediaUrl = await cloudMediaService.uploadMedia(mediaUrl, 'inbox_media', user.id);
                } catch (uploadError) {
                  console.error('[ChatStore] Media upload failed:', uploadError);
                  // Update optimistic message to failed status
                  set(state => {
                    const threadMsgs = state.messages[threadId] || [];
                    return {
                      messages: { ...state.messages, [threadId]: threadMsgs.map(m => m.id === messageId ? { ...m, status: 'error' } as any : m) }
                    };
                  });
                  return; // Don't insert into DB if upload fails
                }
              }
            }
          }

          // Extra safety check: never insert local URIs to remote DB
          if (finalMediaUrl && typeof finalMediaUrl === 'string' && finalMediaUrl.includes('file:///data')) {
            console.error('[ChatStore] Safety check failed: finalMediaUrl contains local file paths. Aborting.');
            return;
          }

          let parsedMediaUrls: any[] = [];
          if (finalMediaUrl) {
            try {
              const parsed = JSON.parse(finalMediaUrl);
              if (Array.isArray(parsed)) {
                parsedMediaUrls = parsed.map((m: any) => m.url || m.uri || m);
              } else {
                parsedMediaUrls = [finalMediaUrl];
              }
            } catch (e) {
              parsedMediaUrls = [finalMediaUrl];
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
              media_url: parsedMediaUrls.length > 0 ? parsedMediaUrls[0] : finalMediaUrl,
              metadata: parsedMediaUrls.length > 0 ? { mediaUrls: parsedMediaUrls } : null,
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
        const channelName = `chat_${threadId}`;

        // Remove any lingering channel to prevent "cannot add callbacks after subscribe" error
        const existingChannels = supabase.getChannels().filter(c => c.topic === `realtime:${channelName}`);
        existingChannels.forEach(c => supabase.removeChannel(c));

        const channel = supabase.channel(channelName);

        channel
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'inbox_messages', filter: `thread_id=eq.${threadId}` },
            async (payload) => {
              const { data: { user } } = await supabase.auth.getUser();
              const newMsg = messageFromMap(payload.new);
              const isMe = user ? payload.new.sender_id === user.id : false;

              const currentUser = useAuthStore.getState().user;
              const thread = get().threads.find(t => t.id === threadId);
              const participant = thread?.participants.find(p => p.id === payload.new.sender_id);

              newMsg.author = {
                id: payload.new.sender_id,
                isMe,
                displayName: isMe ? (currentUser?.displayName || currentUser?.username || 'Me') : (participant?.displayName || 'User'),
                profileImageUrl: isMe ? (currentUser?.profileImageUrl || '') : (participant?.profileImageUrl || '')
              } as any;

              set(state => {
                const currentMsgs = state.messages[threadId] || [];
                if (currentMsgs.some(m => m.id === newMsg.id)) return state;

                const updatedThreads = state.threads.map(t => {
                  if (t.id === threadId) {
                    return {
                      ...t,
                      lastMessage: newMsg,
                      updatedAt: new Date(newMsg.createdAt),
                      unreadCount: isMe ? t.unreadCount : t.unreadCount + 1
                    };
                  }
                  return t;
                });

                // Sort threads so the most recently updated is at the top
                updatedThreads.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

                return {
                  messages: { ...state.messages, [threadId]: [newMsg, ...currentMsgs] },
                  threads: updatedThreads
                };
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
        const channelName = `chat_${threadId}`;
        const existingChannels = supabase.getChannels().filter(c => c.topic === `realtime:${channelName}`);
        existingChannels.forEach(c => supabase.removeChannel(c));
      },

      startTyping: async (threadId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const channelName = `chat_${threadId}`;
        const channel = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`);
        if (channel) {
          channel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId: user.id, isTyping: true }
          });
        }
      },

      stopTyping: async (threadId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const channelName = `chat_${threadId}`;
        const channel = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`);
        if (channel) {
          channel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId: user.id, isTyping: false }
          });
        }
      },

      markThreadAsRead: async (threadId: string) => {
        try {
          const { error } = await supabase
            .from('inbox')
            .update({ unread_count: 0 })
            .eq('id', threadId)
            .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

          if (!error) {
            set((state) => ({
              threads: state.threads.map(t =>
                t.id === threadId ? { ...t, unreadCount: 0 } : t
              )
            }));
          }
        } catch (e) {
          console.error('[ChatStore] markThreadAsRead error:', e);
        }
      },

      acceptInboxRequest: async (threadId: string) => {
        try {
          const { error } = await supabase.rpc('accept_private_inbox', { target_thread_id: threadId });
          if (error) throw error;
          
          set((state) => ({
            threads: state.threads.map(t =>
              t.id === threadId ? { ...t, status: 'accepted' } : t
            )
          }));
        } catch (e) {
          console.error('[ChatStore] acceptInboxRequest error:', e);
        }
      },

      checkInboxPrivacy: async (participantId: string) => {
        try {
          const { data, error } = await supabase.rpc('check_inbox_privacy', { target_user_id: participantId });
          if (error) throw error;
          if (data && data.length > 0) {
            return {
              isBlocked: data[0].is_blocked,
              isLocked: data[0].is_locked
            };
          }
          return { isBlocked: false, isLocked: false };
        } catch (e) {
          console.error('[ChatStore] checkInboxPrivacy error:', e);
          return { isBlocked: false, isLocked: false };
        }
      },

      subscribeToGlobalPresence: async () => {
        // Deprecated: We now use PresenceSyncWorker for offline-first, scalable presence.
        // Relying on global realtime subscriptions causes app crashes at scale.
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
