export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'follow' 
  | 'channel_invite' 
  | 'channel_request' 
  | 'mention' 
  | 'post_tag'
  | 'custom_alert'; // Added for custom manual testing

export interface NotificationPayload {
  recipientId: string;
  type: NotificationType | string; // Allow custom string types too for flexibility
  referenceId?: string;
  actionText?: string;
}
