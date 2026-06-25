import { supabase } from '@/core/supabase/supabaseConfig';

export interface TaggableChannel {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
}

export async function fetchUserTagChannels({
  limit = 20,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
} = {}): Promise<TaggableChannel[]> {
  const userId = supabase.auth.currentSession?.user?.id
    ?? (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    console.error('❌ [TagChannelService] No authenticated user');
    return [];
  }

  // Fetch owned channels
  const { data: ownedData, error: ownedError } = await supabase.rpc('get_user_channels', {
    p_user_id: userId,
    p_target_user_id: userId,
    p_filter_type: 'owned',
    p_page_offset: offset,
    p_page_limit: limit,
  });

  // Fetch joined channels
  const { data: joinedData, error: joinedError } = await supabase.rpc('get_user_channels', {
    p_user_id: userId,
    p_target_user_id: userId,
    p_filter_type: 'joined',
    p_page_offset: offset,
    p_page_limit: limit,
  });

  if (ownedError) console.error('❌ [TagChannelService] owned error:', ownedError.message);
  if (joinedError) console.error('❌ [TagChannelService] joined error:', joinedError.message);

  const map = new Map<string, TaggableChannel>();

  const mapToTaggable = (r: any): TaggableChannel => ({
    id: String(r.id),
    name: r.name ?? 'Channel',
    description: r.description,
    avatarUrl: r.avatar_url,
  });

  // Merge owned and joined channels, avoiding duplicates
  for (const item of (ownedData ?? [])) {
    const id = String(item.id);
    if (!map.has(id)) {
      map.set(id, mapToTaggable(item));
    }
  }

  for (const item of (joinedData ?? [])) {
    const id = String(item.id);
    if (!map.has(id)) {
      map.set(id, mapToTaggable(item));
    }
  }

  return Array.from(map.values());
}
