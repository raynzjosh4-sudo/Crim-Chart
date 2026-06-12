export interface ChannelSettingsModel {
  channelId: string;
  joinMethod: 'open' | 'invite' | 'request';
  isPrivate: boolean;
  allowCommentingBy: 'all' | 'members' | 'none';
  allowStatusPostingBy: 'all' | 'members' | 'none';
  allowInvitationsBy: 'all' | 'members' | 'admins';
  preventLeaving: boolean;
  visibleToOtherChannelMembers: boolean;
  visibleToFollowedUsers: boolean;
  giftsVisible: boolean;
  isDiscoverable: boolean;
  countryRestrictions: string[];
  ageRestriction?: string;
}
