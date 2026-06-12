export interface ChannelMomentEntity {
  id: string;
  channelId: string;
  authorId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number;
  viewersCount: number;
  createdAt: Date;
  expiresAt: Date;
}
