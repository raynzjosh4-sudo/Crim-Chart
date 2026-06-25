import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';

export interface ChannelModel {
  id: string;
  title: string;
  imageUrl?: string;
  description?: string;
  youtubeChannelId?: string;
  membersCount: number;
  momentsCount: number;
  messagesCount: number;
  tagsCount: number;
  likesCount: number;
  followersCount: number;
  unreadCount: number;
  pendingRequestsCount: number;
  hasActiveMembers: boolean;
  ageRestriction?: string;
  visibleToOtherChannelMembers: boolean;
  visibleToFollowedUsers: boolean;
  joinMethod: string;
  preventLeaving: boolean;
  countryRestrictions: string[];
  allowCommentingBy: string;
  allowPostingBy: string;
  allowStatusPostingBy: string;
  allowInvitationsBy: string;
  allowChattingBy: string;
  isOwnChannel: boolean;
  isCharted: boolean;
  giftsVisible: boolean;
  isPrivate: boolean;
  isActive: boolean;
  isDiscoverable: boolean;
  creatorId?: string;
  creatorUser: CrimChartUserModel;
  createdAt: Date;
}

export function emptyChannel(): ChannelModel {
  return {
    id: '', title: 'Unknown Channel', membersCount: 0, momentsCount: 0,
    messagesCount: 0, tagsCount: 0, likesCount: 0, followersCount: 0,
    unreadCount: 0, pendingRequestsCount: 0, hasActiveMembers: false, visibleToOtherChannelMembers: true, visibleToFollowedUsers: true,
    joinMethod: 'invite', preventLeaving: false, countryRestrictions: ['Global'], allowCommentingBy: 'all', allowPostingBy: 'all',
    allowStatusPostingBy: 'all', allowInvitationsBy: 'all', allowChattingBy: 'all', isOwnChannel: false, isCharted: false, giftsVisible: true, isPrivate: false,
    isActive: false, isDiscoverable: true,
    creatorUser: { id: '', displayName: '', username: '', profileImageUrl: '' } as any,
    createdAt: new Date(),
  };
}

export function channelFromMap(map: Record<string, any>): ChannelModel {
  return {
    id: map.id?.toString() ?? '',
    title: (map.name ?? map.title ?? 'Channel')?.toString() ?? '',
    imageUrl: (map.avatar_url ?? map.imageUrl ?? '') || '',
    description: (map.description ?? map.bio)?.toString() ?? '',
    youtubeChannelId: map.youtube_channel_id?.toString(),
    isActive: Boolean(map.isActive ?? false),
    creatorId: map.creator_id?.toString(),
    creatorUser: { id: map.creator_id ?? '', displayName: map.creator_name ?? 'Owner', username: '', profileImageUrl: map.creator_avatar_url ?? '' } as any,
    membersCount: Number(map.members_count ?? 0),
    momentsCount: Number(map.moments_count ?? 0),
    messagesCount: Number(map.messages_count ?? 0),
    tagsCount: Number(map.tags_count ?? 0),
    likesCount: Number(map.likes_count ?? 0),
    followersCount: Number(map.followers_count ?? 0),
    unreadCount: Number(map.unread_count ?? 0),
    pendingRequestsCount: Number(map.pending_requests_count ?? 0),
    hasActiveMembers: Boolean(map.has_active_members ?? false),
    ageRestriction: map.age_restriction?.toString(),
    visibleToOtherChannelMembers: map.visible_to_other_channel_members !== undefined ? Boolean(map.visible_to_other_channel_members) : true,
    visibleToFollowedUsers: map.visible_to_followed_users !== undefined ? Boolean(map.visible_to_followed_users) : true,
    joinMethod: map.join_method ?? 'invite',
    preventLeaving: Boolean(map.prevent_leaving ?? false),
    countryRestrictions: map.country_restrictions ? (typeof map.country_restrictions === 'string' ? JSON.parse(map.country_restrictions) : map.country_restrictions) : ['Global'],
    allowCommentingBy: map.allow_commenting_by ?? 'all',
    allowPostingBy: map.allow_posting_by ?? 'all',
    allowStatusPostingBy: map.allow_status_posting_by ?? 'all',
    allowInvitationsBy: map.allow_invitations_by ?? 'all',
    allowChattingBy: map.allow_chatting_by ?? 'all',
    isDiscoverable: map.is_discoverable !== undefined ? Boolean(map.is_discoverable) : true,
    isOwnChannel: false,
    isCharted: Boolean(map.isCharted ?? false),
    giftsVisible: true,
    isPrivate: Boolean(map.isPrivate ?? false),
    createdAt: map.created_at ? new Date(map.created_at) : new Date(),
  };
}
