import { ChannelModel, channelFromMap } from '@/channel/models/ChannelModel';
import { supabase } from '@/core/supabase/client';
import { channelLocalSource } from './sources/ChannelLocalSource';
import { channelRemoteSource } from './sources/ChannelRemoteSource';

export interface ChannelCreateData {
  name: string;
  description: string;
  age_restriction: string;
  visible_to_other_channel_members: boolean;
  visible_to_followed_users: boolean;
  join_method: string;
  prevent_leaving: boolean;
  country_restrictions: string[];
  allow_commenting_by: string;
  allow_status_posting_by: string;
  allow_invitations_by: string;
}

export class ChannelRepository {
  /**
   * Creates a new channel and automatically adds the creator as a member.
   */
  async createChannel(data: ChannelCreateData, avatarUrl?: string | null): Promise<any> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    // In dev mode, we might not have a logged in user. Fallback to a dummy UUID if needed,
    // but in production this should throw if user is not authenticated.
    const creatorId = userData?.user?.id || '00000000-0000-0000-0000-000000000000';

    if (userError && !userData?.user) {
      console.warn('ChannelRepository: No authenticated user found, using dummy UUID for creator_id');
    }

    const channelPayload = {
      creator_id: creatorId,
      name: data.name,
      description: data.description,
      avatar_url: avatarUrl || null,
      age_restriction: data.age_restriction,
      visible_to_other_channel_members: data.visible_to_other_channel_members,
      visible_to_followed_users: data.visible_to_followed_users,
      join_method: data.join_method,
      prevent_leaving: data.prevent_leaving,
      // Convert array to JSON array for JSONB column
      country_restrictions: data.country_restrictions,
      allow_commenting_by: data.allow_commenting_by,
      allow_status_posting_by: data.allow_status_posting_by,
      allow_invitations_by: data.allow_invitations_by,
    };

    // 1. Insert into public.channels
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert(channelPayload)
      .select('*')
      .single();

    if (channelError) {
      throw new Error(`Failed to create channel: ${channelError.message}`);
    }

    // 2. Insert into public.channel_members to add the creator as a member/admin
    const memberPayload = {
      channel_id: channel.id,
      user_id: creatorId,
      role: 'creator',
      is_following: true,
      unread_count: 0,
      unread_moments_count: 0
    };

    const { error: memberError } = await supabase
      .from('channel_members')
      .upsert(memberPayload, { onConflict: 'channel_id,user_id', ignoreDuplicates: true });

    if (memberError) {
      console.error('Failed to add creator as member:', memberError);
      // Depending on strictness, we could rollback or just swallow this error.
      // throw new Error(`Failed to add member: ${memberError.message}`);
    }

    // Save to local DB cache
    await channelLocalSource.saveChannels([channelFromMap(channel)]);

    return channel;
  }

  /**
   * Fetches user channels using the unified remote and local sources.
   * Tries local SQLite first for 'owned' and 'joined' for speed, then syncs from remote.
   * For 'similar', it fetches directly from Remote (Supabase RPC) and does not store locally.
   */
  async fetchUserChannels(userId: string, filterType: 'owned' | 'joined' | 'similar', page: number, targetUserId?: string, limit = 10): Promise<{ channel: ChannelModel, type: string }[]> {
    try {
      if (filterType === 'similar') {
        // Similar channels are not cached locally, query remote directly.
        return await channelRemoteSource.getUserChannels(userId, filterType, page, targetUserId, limit);
      }

      // For 'owned' and 'joined', use offline-first caching strategy
      // 1. Kick off background remote fetch and local sync
      channelRemoteSource.getUserChannels(userId, filterType, page, targetUserId, limit)
        .then(async (remoteChannelsWithType) => {
          const remoteChannels = remoteChannelsWithType.map(r => r.channel);
          try {
            await channelLocalSource.saveChannels(remoteChannels);
          } catch (err) {
            console.error(`Local save failed for ${filterType} in background sync:`, err);
          }
        })
        .catch(err => console.error(`Failed to sync remote ${filterType} channels`, err));

      const offset = page * limit;
      let localChannelsRaw: any[] = [];

      try {
        if (filterType === 'owned' || filterType === 'joined') {
          localChannelsRaw = await channelLocalSource.getUserChannels(userId, filterType, limit, offset);
        }
      } catch (err) {
        console.error(`Local read failed for ${filterType}:`, err);
      }

      if (localChannelsRaw.length > 0) {
        return localChannelsRaw.map(c => ({
          channel: channelFromMap(c),
          type: filterType
        }));
      }

      // If local is empty, wait for remote
      const remoteChannelsWithType = await channelRemoteSource.getUserChannels(userId, filterType, page, targetUserId, limit);
      const remoteChannels = remoteChannelsWithType.map(r => r.channel);

      try {
        await channelLocalSource.saveChannels(remoteChannels);
      } catch (err) {
        console.error(`Local save failed for ${filterType} in primary fetch:`, err);
      }

      return remoteChannelsWithType;
    } catch (e) {
      console.error('fetchUserChannels error:', e);
      return []; // Return empty array instead of crashing so UI doesn't break
    }
  }

  async getExploreChannels(userId: string, page: number, limit = 10): Promise<ChannelModel[]> {
    try {
      const channels = await channelRemoteSource.getExploreChannels(userId, page, limit);
      return channels;
    } catch (e) {
      console.error('getExploreChannels error:', e);
      return [];
    }
  }

  async getProfileSuggestedChannels(profileUserId: string, currentUserId: string, page: number, limit = 10): Promise<ChannelModel[]> {
    try {
      const channels = await channelRemoteSource.getProfileSuggestedChannels(profileUserId, currentUserId, page, limit);
      return channels;
    } catch (e) {
      console.error('getProfileSuggestedChannels error:', e);
      return [];
    }
  }

  async discoverYoutubeChannels(query?: string): Promise<any[]> {
    try {
      return await channelRemoteSource.discoverYoutubeChannels(query);
    } catch (e) {
      console.error('discoverYoutubeChannels error:', e);
      return [];
    }
  }

  async createChannelRequest(channelId: string, targetUserId: string, requestType: 'admin_invite' | 'member_invite' | 'join_request' | 'leave_request', requestedById: string): Promise<void> {
    return channelRemoteSource.createChannelRequest(channelId, targetUserId, requestType, requestedById);
  }

  async getPendingChannelRequests(channelId: string): Promise<any[]> {
    return channelRemoteSource.getPendingChannelRequests(channelId);
  }

  async updateChannelRequestStatus(requestId: string, status: 'approved' | 'rejected' | 'canceled'): Promise<void> {
    return channelRemoteSource.updateChannelRequestStatus(requestId, status);
  }

  async leaveChannel(channelId: string, userId: string): Promise<void> {
    return channelRemoteSource.leaveChannel(channelId, userId);
  }

  /**
   * Resets the unread message count for a user in a channel to 0.
   * Call this when the user opens the messages tab of a channel.
   */
  async markChannelRead(channelId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('channel_members')
        .update({ unread_count: 0 })
        .eq('channel_id', channelId)
        .eq('user_id', userId);
    } catch (err) {
      console.error('[ChannelRepository] Failed to mark channel as read:', err);
    }
  }
}

export const channelRepository = new ChannelRepository();
