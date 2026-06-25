import { dbService } from '@/core/db/database';
import { FeedStatusItem, feedStatusFromMap } from '../models/FeedStatusItem';

const TABLE = 'cached_feed_statuses';

export const feedStatusesLocalSource = {
  /**
   * Returns all non-expired statuses from local cache, ordered by created_at DESC.
   */
  async getActive(): Promise<FeedStatusItem[]> {
    const now = Date.now();
    const rows = await dbService.query<any>(
      `SELECT * FROM ${TABLE}
       WHERE expires_at IS NULL OR expires_at > ?
       ORDER BY created_at DESC`,
      [now]
    );
    return rows.map(feedStatusFromMap);
  },

  /**
   * Batch upsert statuses. Uses INSERT OR REPLACE for atomic cache refresh.
   */
  async upsertAll(items: FeedStatusItem[]): Promise<void> {
    if (items.length === 0) return;
    const now = Date.now();
    for (const item of items) {
      await dbService.execute(
        `INSERT OR REPLACE INTO ${TABLE} (
          id, author_id, author_name, author_avatar_url,
          image_urls, video_url, audio_url, thumbnail_url,
          caption, is_video, is_audio,
          created_at, expires_at, fetched_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.authorId,
          item.authorName,
          item.authorAvatarUrl,
          JSON.stringify(item.imageUrls),
          item.videoUrl,
          item.audioUrl,
          item.thumbnailUrl,
          item.caption,
          item.isVideo ? 1 : 0,
          item.isAudio ? 1 : 0,
          item.createdAt.getTime(),
          item.expiresAt ? item.expiresAt.getTime() : null,
          now,
        ]
      );
    }
  },

  /**
   * Removes statuses that have already expired from the local cache.
   */
  async deleteExpired(): Promise<void> {
    const now = Date.now();
    await dbService.execute(
      `DELETE FROM ${TABLE} WHERE expires_at IS NOT NULL AND expires_at < ?`,
      [now]
    );
  },
};
