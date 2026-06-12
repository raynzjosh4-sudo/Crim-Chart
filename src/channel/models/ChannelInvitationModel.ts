export interface ChannelInvitationModel {
  id: string;
  channelId: string;
  senderId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}
