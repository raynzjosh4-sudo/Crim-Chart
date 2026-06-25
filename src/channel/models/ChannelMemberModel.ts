export interface ChannelMemberModel {
  channelId: string;
  userId: string;
  displayName?: string;
  profileImageUrl?: string;
  role: 'owner' | 'admin' | 'member';
  unreadCount: number;
  unreadMomentsCount: number;
  isFollowing: boolean;
  canChat: boolean;
  joinedAt: Date;
}

export function channelMemberFromMap(map: Record<string, any>): ChannelMemberModel {
  return {
    channelId: (map.channel_id ?? map.channelId)?.toString() ?? '',
    userId: (map.user_id ?? map.userId)?.toString() ?? '',
    displayName: map.user?.display_name ?? map.display_name ?? '',
    profileImageUrl: map.user?.profile_image_url ?? map.profile_image_url ?? '',
    role: (map.role ?? 'member') as any,
    unreadCount: Number(map.unread_count ?? map.unreadCount ?? 0),
    unreadMomentsCount: Number(map.unread_moments_count ?? 0),
    isFollowing: Boolean(map.is_following ?? map.isFollowing ?? true),
    canChat: Boolean(map.can_chat ?? true),
    joinedAt: map.joined_at ? new Date(map.joined_at) : new Date(),
  };
}
