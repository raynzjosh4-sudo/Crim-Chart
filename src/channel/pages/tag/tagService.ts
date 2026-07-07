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

/** Fetch mutual followers (users who both follow each other) for the current user. */
export async function fetchMutualFollowers({
  limit = 20,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
} = {}): Promise<{ id: string; displayName: string; avatarUrl?: string }[]> {
  const userId =
    supabase.auth.currentSession?.user?.id ??
    (await supabase.auth.getUser()).data.user?.id ?? '';

  if (!userId) return [];

  // Mutual follow = A follows B AND B follows A
  try {
    // 1. Who do I follow?
    const { data: iFollow, error: err1 } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (err1) throw err1;

    // 2. Who follows me?
    const { data: followMe, error: err2 } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId);

    if (err2) throw err2;

    const iFollowIds = new Set((iFollow ?? []).map((r) => r.following_id));
    const mutualIds = (followMe ?? [])
      .map((r) => r.follower_id)
      .filter((id) => iFollowIds.has(id))
      .slice(offset, offset + limit);

    if (mutualIds.length === 0) return [];

    // 3. Fetch their profiles
    const { data: profiles, error: err3 } = await supabase
      .from('profiles')
      .select('id, display_name, profile_image_url')
      .in('id', mutualIds);

    if (err3) throw err3;

    return (profiles ?? []).map((p: any) => ({
      id: String(p.id),
      displayName: p.display_name ?? 'User',
      avatarUrl: p.profile_image_url,
    }));
  } catch (error) {
    console.error('[TagService] fetchMutualFollowers error:', error);
    return [];
  }
}

/** Tag a post to a user, inserting into the post_tags table. */
export async function createUserTag({
  postId,
  targetUserId,
  sourceTable = 'posts',
}: {
  postId: string;
  targetUserId: string;
  sourceTable?: string;
}): Promise<void> {
  const userId =
    supabase.auth.currentSession?.user?.id ??
    (await supabase.auth.getUser()).data.user?.id;

  if (!userId) throw new Error('User not authenticated');

  const { error } = await supabase.rpc('tag_user_on_post', {
    p_post_id: postId,
    p_target_user_id: targetUserId,
    p_source_table: sourceTable,
  });

  if (error) {
    console.error('[TagService] createUserTag failed via RPC:', error.message);
    throw error;
  }

  console.log('[TagService] ✅ User tag created successfully!');
}
