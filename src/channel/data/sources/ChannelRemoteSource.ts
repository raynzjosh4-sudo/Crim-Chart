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

  async searchChannels(query: string): Promise<ChannelModel[]> {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(30);
    if (error) throw error;
    return (data ?? []).map(channelFromMap);
  }
}

export const channelRemoteSource = new ChannelRemoteSource();
