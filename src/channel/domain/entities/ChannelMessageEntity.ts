export interface ChannelMessageEntity {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: Date;
  isRead: boolean;
}
