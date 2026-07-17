import { channelLocalSource } from '@/channel/data/sources/ChannelLocalSource';
import { channelRemoteSource } from '@/channel/data/sources/ChannelRemoteSource';
import { Platform } from 'react-native';

export class ChannelRepositoryImpl {
  getChannels = (page: number) => channelRemoteSource.getChannels(page);
  getChannelById = (id: string) => channelRemoteSource.getChannelById(id);
  getLocalChannelById = (id: string) => channelLocalSource.getChannelById(id);
  updateLocalChannelSettings = async (id: string, updates: Record<string, any>) => {
    await channelLocalSource.updateChannelSettings(id, updates);
    try {
      await channelRemoteSource.updateChannelSettings(id, updates);
    } catch (err) {
      console.error('Failed to sync to Supabase', err);
    }
  };
  getChannelMembers = (id: string) => channelRemoteSource.getChannelMembers(id);
  joinChannel = (channelId: string, userId: string) => channelRemoteSource.joinChannel(channelId, userId);
  leaveChannel = (channelId: string, userId: string) => channelRemoteSource.leaveChannel(channelId, userId);
  searchChannels = (query: string) => channelRemoteSource.searchChannels(query);
  updateMemberChatPermission = (channelId: string, userId: string, canChat: boolean) =>
    channelRemoteSource.updateMemberChatPermission(channelId, userId, canChat);
  getChannelDetails = (channelId: string, currentUserId?: string) => channelRemoteSource.getChannelDetails(channelId, currentUserId);
  getChannelStatuses = (channelId: string, page: number = 0, limit: number = 10) => channelRemoteSource.getChannelStatuses(channelId, page, limit);
  getChannelPosts = (channelId: string, page: number = 0, limit: number = 10) => channelRemoteSource.getChannelPosts(channelId, page, limit);
  getChannelMessages = async (channelId: string, page: number) => {
    let remoteMessages: any[] = [];
    try {
      remoteMessages = await channelRemoteSource.getChannelMessages(channelId, page, 10);
      
      if (Platform.OS !== 'web') {
        // If fetching the first page succeeds, clear local cache to remove deleted messages
        if (page === 0) {
          await channelLocalSource.clearChannelMessages(channelId);
        }

        // Sync to local DB
        for (const msg of remoteMessages) {
          await channelLocalSource.saveMessage({
            id: msg.id,
            channel_id: msg.channel_id,
            sender_id: msg.sender_id,
            sender_name: msg.author?.display_name || 'Unknown',
            sender_avatar_url: msg.author?.profile_image_url || null,
            text: msg.text_content || '',
            media_url: msg.media_url,
            media_type: msg.media_type,
            metadata: msg.metadata,
            created_at: msg.created_at,
            is_pending: 0
          });
        }
      }
    } catch (err) {
      console.warn('Failed to sync remote messages. Falling back to local cache.', err);
    }

    if (Platform.OS === 'web') {
      return remoteMessages.map(msg => ({
        id: msg.id,
        channel_id: msg.channel_id,
        sender_id: msg.sender_id,
        sender_name: msg.author?.display_name || 'Unknown',
        sender_avatar_url: msg.author?.profile_image_url || null,
        text: msg.text_content || '',
        media_url: msg.media_url,
        media_type: msg.media_type,
        metadata: msg.metadata,
        created_at: msg.created_at,
        is_pending: 0
      }));
    }

    // Always read from local to maintain unified format
    return channelLocalSource.getChannelMessages(channelId, 10, page * 10);
  };

  createChannelMessage = async (channelId: string, authorId: string, text: string, mediaUrls?: any[]) => {
    // 1. Save to Remote Supabase
    let remoteMsg: any = null;
    try {
      console.log('[Pipeline Step 3.5] Repository: Sending HTTP request to Supabase to insert row...');
      remoteMsg = await channelRemoteSource.createChannelMessage(channelId, authorId, text, mediaUrls);
      console.log('[Pipeline Step 4] Repository: Supabase Insert SUCCESS! ID:', remoteMsg.id);
    } catch (e) {
      console.warn('[Pipeline Step 4] Repository: Failed to sync message to remote Supabase', e);
    }

    // 2. Save to Local SQLite
    console.log('[Pipeline Step 5] Repository: Formatting message for local SQLite cache...');
    const newMsg = {
      id: remoteMsg?.id || Date.now().toString(),
      channel_id: channelId,
      sender_id: authorId,
      sender_name: remoteMsg?.author?.display_name || 'Admin',
      sender_avatar_url: remoteMsg?.author?.profile_image_url || null,
      text,
      media_url: mediaUrls && mediaUrls.length > 0 ? (mediaUrls[0].url || mediaUrls[0].uri || mediaUrls[0]) : null,
      media_type: mediaUrls && mediaUrls.length > 0 ? (mediaUrls[0].type || 'image') : 'text',
      metadata: mediaUrls && mediaUrls.length > 0 ? { mediaUrls: mediaUrls.map((m: any) => m.url || m.uri || m) } : null,
      created_at: remoteMsg?.created_at || new Date().toISOString(),
      is_pending: remoteMsg ? 0 : 1
    };

    await channelLocalSource.saveMessage(newMsg);
    console.log('[Pipeline Step 6] LocalDB: Successfully inserted into SQLite DB!');
    return newMsg;
  };

  /**
   * Resets the unread message count for a user in a specific channel to 0.
   * Called when the user opens the Messages tab to dismiss the badge.
   */
  markChannelRead = async (channelId: string, userId: string): Promise<void> => {
    try {
      // 1. Optimistically clear the local SQLite cache so the channel list updates immediately
      await channelLocalSource.updateChannelSettings(channelId, { unread_count: 0 });

      // 1.5 Emit event to update React state in hooks
      import('react-native').then(({ DeviceEventEmitter }) => {
        DeviceEventEmitter.emit('channel_marked_read', { channelId });
      });

      // 2. Persist to Supabase
      const { supabase } = await import('@/core/supabase/client');
      await supabase
        .from('channel_members')
        .update({ unread_count: 0 })
        .eq('channel_id', channelId)
        .eq('user_id', userId);
    } catch (err) {
      console.error('[ChannelRepositoryImpl] Failed to mark channel as read:', err);
    }
  };
}

export const channelRepository = new ChannelRepositoryImpl();
