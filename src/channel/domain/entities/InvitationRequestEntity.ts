export interface InvitationRequestEntity {
  id: string;
  channelId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}
