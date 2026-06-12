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
  hasActiveMembers: boolean;
  ageRestriction?: string;
  visibleToOtherChannelMembers: boolean;
  visibleToFollowedUsers: boolean;
  joinMethod: string;
  preventLeaving: boolean;
  countryRestrictions: string[];
  allowCommentingBy: string;
  allowStatusPostingBy: string;
  allowInvitationsBy: string;
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
    unreadCount: 0, hasActiveMembers: false, visibleToOtherChannelMembers: true, visibleToFollowedUsers: true,
    joinMethod: 'invite', preventLeaving: false, countryRestrictions: ['Global'],
    allowCommentingBy: 'all', allowStatusPostingBy: 'all', allowInvitationsBy: 'all',
    isOwnChannel: false, isCharted: false, giftsVisible: true, isPrivate: false,
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
    hasActiveMembers: Boolean(map.has_active_members ?? false),
    visibleToOtherChannelMembers: true,
    visibleToFollowedUsers: true,
    joinMethod: map.join_method ?? 'invite',
    preventLeaving: false,
    countryRestrictions: ['Global'],
    allowCommentingBy: map.allow_commenting_by ?? 'all',
    allowStatusPostingBy: map.allow_status_posting_by ?? 'all',
    allowInvitationsBy: map.allow_invitations_by ?? 'all',
    isDiscoverable: (map.is_discoverable ?? 1) !== 0,
    isOwnChannel: false,
    isCharted: Boolean(map.isCharted ?? false),
    giftsVisible: true,
    isPrivate: Boolean(map.isPrivate ?? false),
    createdAt: map.created_at ? new Date(map.created_at) : new Date(),
  };
}
