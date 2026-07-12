import { FeedVideoItem } from '../core/models/FeedVideoItem';

/** VideoPost extends FeedVideoItem with additional competition fields. */
export interface VideoPost extends FeedVideoItem {
  isCompetition: boolean;
  competitorId?: string;
  competitorName?: string;
  competitorAvatarUrl?: string;
  competitorLikes?: number;
  chartPoints: number;
  isCharted: boolean;
  sharesCount: number;
  tagsCount: number;
}

export function videoPostFromMap(map: Record<string, unknown>): VideoPost {
  return {
    id: String(map['id'] ?? ''),
    postId: String(map['post_id'] ?? map['id'] ?? ''),
    videoUrl: String(map['video_url'] ?? map['videoUrl'] ?? ''),
    videoUrls: Array.isArray(map['video_urls']) ? map['video_urls'].map(String) : (map['videoUrls'] as string[] | undefined),
    thumbnailUrl: map['thumbnail_url'] as string | undefined,
    caption: map['caption'] as string | undefined,
    authorId: String(map['author_id'] ?? ''),
    authorName: String(map['author_name'] ?? 'User'),
    authorAvatarUrl: map['author_avatar'] as string | undefined,
    channelId: map['channel_id'] as string | undefined,
    channelName: map['channel_name'] as string | undefined,
    likesCount: Number(map['likes_count'] ?? 0),
    commentsCount: Number(map['comments_count'] ?? 0),
    isLiked: Boolean(map['is_liked']),
    aspectRatio: map['aspect_ratio'] as number | undefined,
    durationSeconds: map['duration_seconds'] as number | undefined,
    createdAt: map['created_at'] ? new Date(String(map['created_at'])) : new Date(),
    isCompetition: Boolean(map['is_competition']),
    competitorId: map['competitor_id'] as string | undefined,
    competitorName: map['competitor_name'] as string | undefined,
    competitorAvatarUrl: map['competitor_avatar'] as string | undefined,
    competitorLikes: map['competitor_likes'] as number | undefined,
    chartPoints: Number(map['chart_points'] ?? 0),
    isCharted: Boolean(map['is_charted']),
    sharesCount: Number(map['shares_count'] ?? 0),
    tagsCount: Number(map['tags_count'] ?? 0),
  };
}
