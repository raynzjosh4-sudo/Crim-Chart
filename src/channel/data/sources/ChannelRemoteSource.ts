import { channelMemberFromMap, ChannelMemberModel } from '@/channel/models/ChannelMemberModel';
import { channelFromMap, ChannelModel } from '@/channel/models/ChannelModel';
import { supabase } from '@/core/supabase/client';

export class ChannelRemoteSource {
  async getChannels(page: number, limit = 20): Promise<ChannelModel[]> {
    const from = page * limit;
    const { data, error } = await supabase
      .from('channels')
      .select('*, users:creator_id(*)')
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw error;
    return (data ?? []).map(channelFromMap);
  }

  async getUserChannels(userId: string, filterType: 'owned' | 'joined' | 'similar', page: number, targetUserId?: string, limit = 10): Promise<{ channel: ChannelModel, type: string }[]> {
    const from = page * limit;
    const { data, error } = await supabase
      .rpc('get_user_channels', {
        p_user_id: userId,
        p_target_user_id: targetUserId || null,
        p_filter_type: filterType,
        p_page_offset: from,
        p_page_limit: limit
      });

    console.log(`[SUPABASE RPC] ${filterType} channels returned:`, data?.length || 0, 'rows. Error:', error);

    if (error) throw error;

    // The RPC returns { id, creator_id, name, ..., channel_type }
    // We map the row into a proper ChannelModel and pass the type along
    return (data ?? []).map((row: any) => ({
      channel: channelFromMap({
        ...row,
        // The RPC returns creator_name and creator_avatar_url, which channelFromMap expects
      }),
      type: row.channel_type
    }));
  }

  async getExploreChannels(userId: string, page: number, limit = 10): Promise<ChannelModel[]> {
    const from = page * limit;
    const { data, error } = await supabase
      .rpc('get_explore_channels', {
        p_user_id: userId,
        p_page_offset: from,
        p_page_limit: limit
      });

    console.log(`[SUPABASE RPC] explore channels returned:`, data?.length || 0, 'rows. Error:', error);

    if (error) throw error;

    return (data ?? []).map((row: any) => channelFromMap({
      ...row,
    }));
  }

  async getProfileSuggestedChannels(profileUserId: string, currentUserId: string, page: number, limit = 10): Promise<ChannelModel[]> {
    const from = page * limit;
    const { data, error } = await supabase
      .rpc('get_profile_suggested_channels', {
        p_profile_user_id: profileUserId,
        p_current_user_id: currentUserId,
        p_page_offset: from,
        p_page_limit: limit
      });

    console.log(`[SUPABASE RPC] profile suggested channels returned:`, data?.length || 0, 'rows. Error:', error);

    if (error) throw error;

    return (data ?? []).map((row: any) => channelFromMap({
      ...row,
    }));
  }

  async discoverYoutubeChannels(query?: string): Promise<any[]> {
    const { data, error } = await supabase.functions.invoke('discover-youtube-channels', {
      body: query ? { query } : {}
    });
    if (error) throw error;
    return data?.data ?? [];
  }

  async getChannelById(channelId: string): Promise<ChannelModel | null> {
    const { data, error } = await supabase
      .from('channels')
      .select('*, users:creator_id(*)')
      .eq('id', channelId)
      .single();
    if (error) return null;
    return channelFromMap(data);
  }

  async getChannelMembers(channelId: string): Promise<ChannelMemberModel[]> {
    const { data, error } = await supabase
      .from('channel_members')
      .select('*, user:user_id(*)')
      .eq('channel_id', channelId)
      .order('joined_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(channelMemberFromMap);
  }

  async joinChannel(channelId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('channel_members')
      .insert({ channel_id: channelId, user_id: userId, role: 'member' });
    if (error) throw error;
  }

  async leaveChannel(channelId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('channel_members')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', userId);
    if (error) throw error;
  }

  async updateMemberChatPermission(channelId: string, userId: string, canChat: boolean): Promise<void> {
    const { error } = await supabase
      .from('channel_members')
      .update({ can_chat: canChat })
      .eq('channel_id', channelId)
      .eq('user_id', userId);
    if (error) throw error;
  }

  async searchChannels(query: string): Promise<ChannelModel[]> {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(30);
    if (error) throw error;
    return (data ?? []).map(channelFromMap);
  }

  async updateChannelSettings(channelId: string, updates: Record<string, any>): Promise<void> {
    console.log(`[Supabase UPDATE] Attempting to update channel ${channelId} with:`, updates);
    const { data, error, count } = await supabase
      .from('channels')
      .update(updates)
      .eq('id', channelId)
      .select(); // Add .select() to get back the updated rows

    if (error) {
      console.error('[Supabase UPDATE] ERROR:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error('[Supabase UPDATE] FAILED: Update returned 0 rows! This usually means Row Level Security (RLS) blocked the update, or the channel ID does not exist.');
    } else {
      console.log('[Supabase UPDATE] SUCCESS:', data[0]);
    }
  }

  async createChannelRequest(channelId: string, targetUserId: string, requestType: 'admin_invite' | 'member_invite' | 'join_request' | 'leave_request', requestedById: string): Promise<void> {
    const { error } = await supabase
      .from('channel_requests')
      .insert({
        channel_id: channelId,
        target_user_id: targetUserId,
        request_type: requestType,
        requested_by_id: requestedById,
        status: 'pending'
      });
    if (error) {
      if (error.code !== '23505' && !error.message?.includes('unique_pending_request_idx')) {
        console.error('Supabase create request error:', error);
      }
      throw error;
    }
  }

  async getPendingChannelRequests(channelId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('channel_requests')
      .select(`
        *,
        target_user:profiles!channel_requests_target_user_id_fkey(id, display_name, profile_image_url),
        requested_by:profiles!channel_requests_requested_by_id_fkey(id, display_name, profile_image_url)
      `)
      .eq('channel_id', channelId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch requests error:', error);
      return [];
    }
    return data ?? [];
  }

  async updateChannelRequestStatus(requestId: string, status: 'approved' | 'rejected' | 'canceled'): Promise<void> {
    const { error } = await supabase
      .from('channel_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId);
    if (error) {
      console.error('Supabase update request status error:', error);
      throw error;
    }
  }

  async getChannelDetails(channelId: string, currentUserId?: string): Promise<ChannelModel | null> {
    // Validate that channelId is a valid UUID before calling Supabase RPC
    // to prevent errors like "invalid input syntax for type uuid: 'user_feed'"
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(channelId)) {
      return null;
    }

    const { data, error } = await supabase
      .rpc('get_channel_details', {
        p_channel_id: channelId,
        p_user_id: currentUserId || null
      });

    if (error) {
      console.error('Supabase get_channel_details error:', error);
      return null;
    }

    if (!data || data.length === 0) return null;

    // The RPC returns a flat record with all channel fields and creator fields
    // We map it using channelFromMap
    const channelData = data[0];
    const channel = channelFromMap(channelData);

    // If we need the specific user role, we could potentially attach it to the ChannelModel
    // or return it alongside. Since ChannelModel doesn't have a userRole field currently,
    // we just return the channel. The role can be fetched separately or added to the model later.
    return channel;
  }

  async getChannelStatuses(channelId: string, page: number = 0, limit: number = 10): Promise<any[]> {
    const from = page * limit;
    const { data, error } = await supabase
      .from('channel_statuses')
      .select('*, author:author_id(id, display_name, profile_image_url, bio)')
      .eq('channel_id', channelId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      console.error('Supabase fetch channel statuses error:', error);
      return [];
    }

    return data ?? [];
  }

  async getChannelPosts(channelId: string, page: number = 0, limit: number = 10): Promise<any[]> {
    const from = page * limit;
    const { data, error } = await supabase
      .from('unified_channel_posts_view')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      console.error('Supabase fetch channel posts error:', error);
      return [];
    }

    return data ?? [];
  }

  async getChannelMessages(channelId: string, page: number, limit = 50): Promise<any[]> {
    const from = page * limit;
    const { data, error } = await supabase
      .from('channel_messages')
      .select('*, author:sender_id(id, display_name, profile_image_url)')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      console.error('Supabase fetch channel messages error:', error);
      return [];
    }
    return data ?? [];
  }

  async createChannelMessage(channelId: string, authorId: string, text: string, mediaUrls: any[] = []): Promise<any> {
    const payload = {
      channel_id: channelId,
      sender_id: authorId,
      text_content: text === '' ? null : text,
      media_url: mediaUrls && mediaUrls.length > 0 ? (mediaUrls[0].url || mediaUrls[0].uri || mediaUrls[0]) : null,
      media_type: mediaUrls && mediaUrls.length > 0 ? (mediaUrls[0].type || 'image') : 'text',
      metadata: mediaUrls && mediaUrls.length > 0 ? { mediaUrls: mediaUrls.map(m => m.url || m.uri || m) } : null,
    };
    console.log('[DEBUG] Inserting payload into channel_messages:', JSON.stringify(payload));

    const { data, error } = await supabase
      .from('channel_messages')
      .insert(payload)
      .select('*, author:sender_id(id, display_name, profile_image_url)')
      .single();
    if (error) {
      console.error('Supabase create channel message error:', error);
      throw error;
    }
    return data;
  }

  async deleteChannelMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('channel_messages')
      .delete()
      .eq('id', messageId);
    if (error) {
      console.error('Supabase delete channel message error:', error);
      throw error;
    }
  }
}

export const channelRemoteSource = new ChannelRemoteSource();
