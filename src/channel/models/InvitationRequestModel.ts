export interface InvitationRequestModel {
  id: string;
  channelId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
}
