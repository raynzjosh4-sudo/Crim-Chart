import { supabase } from '@/core/supabase/client';
import { TagEntity } from '@/channel/domain/entities/TagEntity';

export class TagRemoteSource {
  async getTags(page: number, limit = 20): Promise<TagEntity[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('channels_count', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
    if (error) throw error;
    return (data ?? []).map((t: any) => ({
      id: t.id, name: t.name,
      channelsCount: t.channels_count ?? 0,
      postsCount: t.posts_count ?? 0,
      imageUrl: t.image_url,
    }));
  }

  async searchTags(query: string): Promise<TagEntity[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(20);
    if (error) throw error;
    return (data ?? []).map((t: any) => ({
      id: t.id, name: t.name,
      channelsCount: t.channels_count ?? 0,
      postsCount: t.posts_count ?? 0,
      imageUrl: t.image_url,
    }));
  }
}

export const tagRemoteSource = new TagRemoteSource();
