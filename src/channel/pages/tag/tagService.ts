import { supabase } from '@/core/supabase/supabaseConfig';

/** Tag a post to a target channel, creating a record in channel_content_tags. */
export async function createTag({
  postId,
  sourceChannelId,
  targetChannelId,
  linkChain,
}: {
  postId: string;
  sourceChannelId?: string | null;
  targetChannelId: string;
  linkChain: string[];
}): Promise<void> {
  const userId = supabase.auth.currentSession?.user?.id
    ?? (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    console.error('❌ [TagService] No authenticated user');
    throw new Error('User not authenticated');
  }

  const payload = {
    post_id: postId,
    user_id: userId,
    source_channel_id: sourceChannelId || null,
    target_channel_id: targetChannelId,
    link_chain: linkChain,
  };

  console.log('🚀 [TagService] Inserting tag into channel_content_tags', payload);

  const { error } = await supabase
    .from('channel_content_tags')
    .insert(payload);

  if (error) {
    if (error.code === '23505') {
      console.log('⚠️ [TagService] User already tagged this post to this channel. Ignoring duplicate.');
      return; // Silently resolve since the intent is already fulfilled
    }
    console.error('❌ [TagService] Insert failed:', error.message);
    throw error;
  }

  console.log('✅ [TagService] Tag created successfully!');
}

/** Remove a tag by its id. */
export async function removeTag(tagId: string): Promise<void> {
  const { error } = await supabase
    .from('channel_content_tags')
    .delete()
    .eq('id', tagId);
  if (error) throw error;
}

/** Fetch channels available to tag to, using the discovery channels RPC. */
export async function fetchTaggableChannels({
  limit = 20,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
} = {}): Promise<{ id: string; name: string; description?: string; avatarUrl?: string }[]> {
  const userId = supabase.auth.currentSession?.user?.id
    ?? (await supabase.auth.getUser()).data.user?.id ?? '';

  const { data, error } = await supabase.rpc('get_social_discovery_channels', {
    p_user_id: userId,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error('❌ [TagService] fetchTaggableChannels error:', error.message);
    return [];
  }

  return (data ?? []).map((r: any) => ({
    id: String(r.id),
    name: r.name ?? 'Channel',
    description: r.description,
    avatarUrl: r.avatar_url,
  }));
}
