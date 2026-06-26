import { useState, useEffect, useCallback, useRef } from 'react';
import { channelRepository } from '@/channel/data/repositories/ChannelRepositoryImpl';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export function useChannelMessages(channelId: string | undefined) {
  const [messages, setMessages] = useState<any[]>([]);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const user = useAuthStore(s => s.user);

  const fetchMessages = useCallback(async (pageNumber: number, isRefresh = false) => {
    if (!channelId || (!hasMore && !isRefresh)) return;

    try {
      if (isRefresh) setLoading(true);
      else setLoadingMore(true);

      const rawData = await channelRepository.getChannelMessages(channelId, pageNumber);

      const mappedMessages = rawData.map((msg: any) => ({
        id: msg.id,
        text: msg.text || '',
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: msg.sender_id === user?.id,
        senderId: msg.sender_id,
        senderName: msg.sender_name || 'Unknown',
        senderAvatarUrl: msg.sender_avatar_url || null,
        mediaItems: (() => {
          let urls: string[] = [];
          if (msg.metadata) {
            const parsed = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata;
            if (parsed.mediaUrls && Array.isArray(parsed.mediaUrls)) {
              urls = parsed.mediaUrls;
            }
          }
          if (urls.length === 0 && msg.media_url) {
            urls = [msg.media_url];
          }
          return urls.map((url: string) => ({ type: msg.media_type, url }));
        })(),
      }));

      // Supabase orderBy created_at DESC returns newest first.
      // This is exactly what our inverted FlatList needs.
      setMessages(isRefresh ? mappedMessages : [...messagesRef.current, ...mappedMessages]);

      setHasMore(rawData.length === 10);
      setPage(pageNumber);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      if (isRefresh) setLoading(false);
      else setLoadingMore(false);
    }
  }, [channelId, hasMore, user?.id]);

  useEffect(() => {
    fetchMessages(0, true);
  }, [fetchMessages]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchMessages(page + 1, false);
    }
  }, [loadingMore, hasMore, page, fetchMessages]);

  return { messages, setMessages, loading, loadingMore, loadMore };
}
