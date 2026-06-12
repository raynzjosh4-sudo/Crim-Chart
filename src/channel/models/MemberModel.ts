export interface MemberModel {
  id: string;
  userId: string;
  channelId: string;
  displayName: string;
  profileImageUrl: string;
  role: string;
  isFollowing: boolean;
  joinedAt: Date;
}
