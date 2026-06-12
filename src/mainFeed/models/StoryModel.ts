export interface StoryModel {
  id: string;
  userId: string;
  mediaUrl: string;
  isVideo: boolean;
  createdAt: Date;
  expiresAt: Date;
  viewCount?: number;
  isViewed?: boolean;
}

export function storyFromMap(map: Record<string, unknown>): StoryModel {
  return {
    id: String(map['id'] ?? ''),
    userId: String(map['user_id'] ?? map['userId'] ?? ''),
    mediaUrl: String(map['media_url'] ?? map['mediaUrl'] ?? ''),
    isVideo: Boolean(map['is_video'] ?? map['isVideo']),
    createdAt: map['created_at'] ? new Date(String(map['created_at'])) : new Date(),
    expiresAt: map['expires_at'] ? new Date(String(map['expires_at'])) : new Date(),
    viewCount: map['view_count'] as number | undefined,
    isViewed: Boolean(map['is_viewed'] ?? map['isViewed']),
  };
}
