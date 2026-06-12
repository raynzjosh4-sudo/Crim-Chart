export interface FeedVideoItem {
  id: string;
  postId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  channelId?: string;
  channelName?: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  aspectRatio?: number;
  durationSeconds?: number;
  createdAt: Date;
}

export function feedVideoFromMap(map: Record<string, unknown>): FeedVideoItem {
  return {
    id: String(map['id'] ?? ''),
    postId: String(map['post_id'] ?? map['postId'] ?? map['id'] ?? ''),
    videoUrl: String(map['video_url'] ?? map['videoUrl'] ?? ''),
    thumbnailUrl: map['thumbnail_url'] as string | undefined,
    caption: map['caption'] as string | undefined,
    authorId: String(map['author_id'] ?? map['authorId'] ?? ''),
    authorName: String(map['author_name'] ?? map['authorName'] ?? 'User'),
    authorAvatarUrl: map['author_avatar'] as string | undefined,
    channelId: map['channel_id'] as string | undefined,
    channelName: map['channel_name'] as string | undefined,
    likesCount: Number(map['likes_count'] ?? map['likesCount'] ?? 0),
    commentsCount: Number(map['comments_count'] ?? map['commentsCount'] ?? 0),
    isLiked: Boolean(map['is_liked'] ?? map['isLiked']),
    aspectRatio: map['aspect_ratio'] as number | undefined,
    durationSeconds: map['duration_seconds'] as number | undefined,
    createdAt: map['created_at'] ? new Date(String(map['created_at'])) : new Date(),
  };
}
