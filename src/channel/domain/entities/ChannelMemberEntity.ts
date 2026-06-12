export interface ChannelMemberEntity {
  channelId: string;
  userId: string;
  role: string;
  unreadCount: number;
  unreadMomentsCount: number;
  isFollowing: boolean;
  joinedAt: Date;
}
