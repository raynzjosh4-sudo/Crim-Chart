export interface FeedStatusItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  imageUrls: string[];
  videoUrl: string | null;
  audioUrl: string | null;
  thumbnailUrl: string | null;
  caption: string | null;
  isVideo: boolean;
  isAudio: boolean;
  createdAt: Date;
  expiresAt: Date | null;
  metadata: Record<string, any> | null;
}

export function feedStatusFromMap(row: any): FeedStatusItem {
  let imageUrls: string[] = [];
  try {
    const raw = row.image_urls;
    if (Array.isArray(raw)) {
      imageUrls = raw;
    } else if (typeof raw === 'string') {
      imageUrls = JSON.parse(raw);
    }
  } catch {}

  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name || row.username || '',
    authorAvatarUrl: row.author_avatar_url || row.profile_image_url || null,
    imageUrls,
    videoUrl: row.video_url || null,
    audioUrl: row.audio_url || null,
    thumbnailUrl: row.thumbnail_url || null,
    caption: row.caption || null,
    isVideo: Boolean(row.is_video),
    isAudio: Boolean(row.is_audio),
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    metadata: row.metadata || null,
  };
}
