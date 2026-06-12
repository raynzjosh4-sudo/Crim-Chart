import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';

export enum MessageType {
  text = 'text',
  image = 'image',
  video = 'video',
  audio = 'audio',
  gif = 'gif',
  post_share = 'post_share',
}

export enum MessageStatus {
  sending = 'sending',
  sent = 'sent',
  delivered = 'delivered',
  read = 'read',
  failed = 'failed',
}

export interface MessageEntity {
  id: string;
  threadId: string;
  author: CrimChartUserModel;
  createdAt: Date;
  text?: string;
  mediaUrl?: string;
  type: MessageType;
  status: MessageStatus;
  isEncrypted: boolean;
  readAt?: Date;
}

export interface ThreadEntity {
  id: string;
  participants: CrimChartUserModel[];
  lastMessage?: MessageEntity;
  unreadCount: number;
  updatedAt: Date;
}

export function messageFromMap(map: Record<string, unknown>): MessageEntity {
  return {
    id: String(map['id'] ?? ''),
    threadId: String(map['thread_id'] ?? map['threadId'] ?? ''),
    author: map['author'] as CrimChartUserModel, // Usually resolved out of band
    createdAt: map['created_at'] ? new Date(String(map['created_at'])) : new Date(),
    text: (map['body'] as string) || (map['text'] as string) || undefined,
    mediaUrl: map['media_url'] as string | undefined,
    type: (map['message_type'] as MessageType) || (map['type'] as MessageType) || MessageType.text,
    status: map['isRead'] ? MessageStatus.read : MessageStatus.sent,
    isEncrypted: Boolean(map['is_encrypted'] ?? map['isEncrypted']),
    readAt: map['read_at'] ? new Date(String(map['read_at'])) : undefined,
  };
}
