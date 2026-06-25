import { supabase } from '@/core/supabase/supabaseConfig';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { PostEntity } from '../../domain/entities/PostEntity';
import { SocialFeedItem } from '../../domain/entities/SocialFeedItem';

export class FeedRemoteSource {
  static async getDiscoveryFeed(limit = 20, offset = 0): Promise<SocialFeedItem[]> {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      console.warn('❌ [SocialFeed Remote] No user ID - cannot fetch from Supabase');
      return [];
    }

    try {
      console.log(`🌐 [SocialFeed Remote] Calling get_social_discovery_feed (limit=${limit}, offset=${offset})`);
      const { data, error } = await supabase.rpc('get_social_discovery_feed', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset
      });

      if (error) throw error;

      const list = data as any[];
      if (!list || list.length === 0) return [];

      const items = list.map(row => SocialFeedItem.fromMap(row));
      
      // Fire-and-forget sync of likes and tags for these posts
      useInteractionStore.getState().syncPostInteractions(items.map(item => item.id));

      return items;
    } catch (e) {
      console.error('❌ [SocialFeed Remote] EXCEPTION in getDiscoveryFeed:', e);
      return [];
    }
  }

  static async getDiscoveryChannels(limit = 20, offset = 0): Promise<CrimChartUserModel[]> {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) return [];

    try {
      const { data, error } = await supabase.rpc('get_social_discovery_channels', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset
      });

      if (error) throw error;

      const list = data as any[];
      if (!list || list.length === 0) return [];

      return list.map((m: any) =>
        CrimChartUserModel.empty().copyWith({
          id: String(m.id || ''),
          displayName: String(m.name || 'Channel'),
          profileImageUrl: String(m.avatar_url || ''),
          bio: m.description,
          followersCount: Number(m.members_count || 0),
        })
      );
    } catch (e) {
      console.error('❌ [Channels Remote] EXCEPTION:', e);
      return [];
    }
  }

  static async getFeed(page = 1, limit = 10): Promise<PostEntity[]> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, author:profiles!posts_author_id_fkey(*)')
        .eq('privacy', 'public')
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex);

      if (error) throw error;
      if (!data) return [];

      const posts = data.map(row => PostEntity.fromMap(row));
      
      // Fire-and-forget sync of likes and tags
      useInteractionStore.getState().syncPostInteractions(posts.map(p => p.id));

      return posts;
    } catch (e) {
      console.error('🚨 [FeedRemoteSource] getFeed FAILED:', e);
      throw new Error(`Failed to get main feed: ${e}`);
    }
  }

  static async getChannelPosts(channelId: string, limit = 10, before?: Date): Promise<PostEntity[]> {
    try {
      let query = supabase
        .from('channel_posts')
        .select('*, author:profiles!channel_posts_author_id_fkey(*)')
        .eq('channel_id', channelId);

      if (before) {
        query = query.lt('created_at', before.toISOString());
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!data) return [];

      const posts = data.map(row => PostEntity.fromMap(row));
      useInteractionStore.getState().syncPostInteractions(posts.map(p => p.id));
      return posts;
    } catch (e) {
      console.error('❌ [FeedRemoteSource] Fetch Failed:', e);
      throw new Error(`Failed to get channel posts: ${e}`);
    }
  }

  static async getMusicFeed(page = 1, limit = 10): Promise<PostEntity[]> {
    const offset = (page - 1) * limit;

    try {
      const { data, error } = await supabase.rpc('get_music_feed', {
        p_limit: limit,
        p_offset: offset
      });

      if (error) throw error;
      if (!data) return [];

      // Map the RPC row directly to PostEntity. 
      // The RPC returns { source_table, post_data, author }
      // console.log('raw music feed data sample:', data.length > 0 ? data[0] : 'empty');
      return (data as any[]).map(row =>
        PostEntity.fromMap({
          ...(row.post_data || {}),
          author: row.author,
          source_table: row.source_table,
          is_audio: true
        })
      );
    } catch (e) {
      console.error('🚨 [FeedRemoteSource] getMusicFeed FAILED:', e);
      throw new Error(`Failed to get music feed: ${e}`);
    }
  }

  static async getVideoFeed(page = 1, limit = 10): Promise<PostEntity[]> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, author:profiles!posts_author_id_fkey(*)')
        .eq('privacy', 'public')
        .eq('is_video', true)
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex);

      if (error) throw error;
      if (!data) return [];

      const posts = data.map(row => PostEntity.fromMap(row));
      
      // Fire-and-forget sync of likes and tags
      useInteractionStore.getState().syncPostInteractions(posts.map(p => p.id));

      return posts;
    } catch (e) {
      console.error('🚨 [FeedRemoteSource] getVideoFeed FAILED:', e);
      throw new Error(`Failed to get video feed: ${e}`);
    }
  }

  static async getStoreFeed(page = 1, limit = 10): Promise<PostEntity[]> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, author:profiles!posts_author_id_fkey(*)')
        .eq('privacy', 'public')
        .eq('type', 'store_item')
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex);

      if (error) throw error;
      if (!data) return [];

      const posts = data.map(row => PostEntity.fromMap(row));
      
      // Fire-and-forget sync of likes and tags
      useInteractionStore.getState().syncPostInteractions(posts.map(p => p.id));

      return posts;
    } catch (e) {
      console.error('🚨 [FeedRemoteSource] getStoreFeed FAILED:', e);
      throw new Error(`Failed to get store feed: ${e}`);
    }
  }
}
