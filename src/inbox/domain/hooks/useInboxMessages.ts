import { useState, useEffect } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { inboxRemoteSource } from '../../data/sources/InboxRemoteSource';

// Simulating local native DB
class NativeDbMock {
  async getInboxMessages(threadId: string, limit: number) { return []; }
  async upsertInboxMessage(msg: any) {}
  async trimInboxMessages(threadId: string, keepCount: number) {}
  async deleteInboxMessage(msgId: string) {}
}
const nativeDb = new NativeDbMock();

export enum ChannelMessageType {
  text = 'text',
  image = 'image',
  video = 'video',
  voice = 'voice',
  lottie = 'lottie'
}

export interface ChannelMessageEntity {
  id: string;
  channelId: string;
  sender: any; // user model
  textContent?: string;
  mediaUrl?: string;
  messageType: ChannelMessageType;
  replyToId?: string;
  createdAt: Date;
  metadata?: any;
  isPending: boolean;
}

export function useInboxMessages(threadId: string) {
  const [messages, setMessages] = useState<ChannelMessageEntity[]>([]);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const loadInitial = async () => {
      const rows = await nativeDb.getInboxMessages(threadId, 10);
      // Map initial local SQLite rows to messages if using WatermelonDB/SQLite
    };
    loadInitial();

    const channel = supabase.channel(`inbox_messages_${threadId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbox_messages', filter: `thread_id=eq.${threadId}` }, (payload) => {
        // Implement real time sync logic updating `messages` state
      }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId]);

  const sendMessage = async (params: {
    text?: string,
    mediaUrl?: string,
    mediaItems?: Array<{url: string, type: string}>,
    replyToId?: string,
    type?: ChannelMessageType,
    metadata?: any
  }) => {
    if (!user) return;
    const type = params.type || ChannelMessageType.text;
    const msgId = uuidv4();

    const optimisticMsg: ChannelMessageEntity = {
      id: msgId,
      channelId: threadId,
      sender: { id: user.id, displayName: user.username, profileImageUrl: user.profileImageUrl },
      textContent: params.text,
      mediaUrl: params.mediaUrl || (params.mediaItems?.length ? params.mediaItems[0].url : undefined),
      messageType: type,
      replyToId: params.replyToId,
      createdAt: new Date(),
      metadata: params.metadata,
      isPending: true,
    };

    setMessages([...messages, optimisticMsg].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()));

    try {
      await inboxRemoteSource.sendInboxMessage(threadId, {
        id: optimisticMsg.id,
        body: optimisticMsg.textContent,
        media_url: optimisticMsg.mediaUrl,
        message_type: optimisticMsg.messageType,
        created_at: optimisticMsg.createdAt.toISOString()
      });

      setMessages(messages.map(m => m.id === msgId ? { ...m, isPending: false } : m));
    } catch (e) {
      console.error('send message failed', e);
    }
  };

  const deleteMessage = async (msgId: string) => {
    setMessages(messages.filter(m => m.id !== msgId));
    await nativeDb.deleteInboxMessage(msgId);
  };

  return { messages, sendMessage, deleteMessage };
}
