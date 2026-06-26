import { ChannelModel } from '@/channel/models/ChannelModel';
import { dbService } from '@/core/db/database';
import { TABLES } from '@/core/db/schema';

export class ChannelLocalSource {
  async saveChannels(channels: ChannelModel[]): Promise<void> {
    if (channels.length === 0) return;
    const db = dbService.database;

    for (const channel of channels) {
      try {
        await db.runAsync(
          `INSERT OR REPLACE INTO ${TABLES.CHANNELS} (
            id, creator_id, name, description, avatar_url, age_restriction, 
            visible_to_other_channel_members, visible_to_followed_users, 
            join_method, prevent_leaving, country_restrictions, allow_commenting_by, allow_posting_by, 
            allow_status_posting_by, allow_chatting_by, is_discoverable, allow_invitations_by, 
            youtube_channel_id, members_count, followers_count, moments_count, 
            messages_count, tags_count, likes_count, unread_count, has_active_members, 
            created_at, sync_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            channel.id, channel.creatorId || null, channel.title, channel.description || null,
            channel.imageUrl || null, channel.ageRestriction || 'All Ages',
            channel.visibleToOtherChannelMembers ? 1 : 0, channel.visibleToFollowedUsers ? 1 : 0,
            channel.joinMethod, channel.preventLeaving ? 1 : 0, JSON.stringify(channel.countryRestrictions),
            channel.allowCommentingBy, channel.allowPostingBy, channel.allowStatusPostingBy, channel.allowChattingBy, channel.isDiscoverable ? 1 : 0,
            channel.allowInvitationsBy, channel.youtubeChannelId || null, channel.membersCount,
            channel.followersCount, channel.momentsCount, channel.messagesCount, channel.tagsCount,
            channel.likesCount, channel.unreadCount, 0, channel.createdAt.getTime(), 'SYNCED'
          ]
        );
      } catch (err) {
        console.error('Failed to save channel silently', err);
      }
    }
  }

  async getUserChannels(userId: string, filterType: 'owned' | 'joined', limit: number, offset: number): Promise<any[]> {
    const db = dbService.database;

    if (filterType === 'owned') {
      return await db.getAllAsync(
        `SELECT * FROM ${TABLES.CHANNELS} WHERE creator_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
    } else if (filterType === 'joined') {
      return await db.getAllAsync(
        `SELECT c.* FROM ${TABLES.CHANNELS} c
         JOIN ${TABLES.CHANNEL_MEMBERS} cm ON c.id = cm.channel_id
         WHERE cm.user_id = ? 
         ORDER BY cm.joined_at DESC LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
    }
    return [];
  }

  async saveMoments(moments: any[]): Promise<void> {
    if (!moments || moments.length === 0) return;
    const db = dbService.database;

    for (const m of moments) {
      try {
        await db.runAsync(
          `INSERT OR REPLACE INTO ${TABLES.CHANNEL_MOMENTS} (
            id, channel_id, author_id, media_url, thumbnail_url, caption, media_type, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            m.id, m.channel_id, m.author_id, m.media_url, m.thumbnail_url || null,
            m.caption || null, m.media_type, m.created_at
          ]
        );
      } catch (err) {
        console.error('Failed to save moment silently', err);
      }
    }
  }

  async getChannelMoments(channelIds: string[]): Promise<any[]> {
    if (channelIds.length === 0) return [];
    const db = dbService.database;
    const placeholders = channelIds.map(() => '?').join(',');

    return await db.getAllAsync(
      `SELECT * FROM ${TABLES.CHANNEL_MOMENTS} WHERE channel_id IN (${placeholders}) ORDER BY created_at DESC`,
      channelIds
    );
  }

  async saveChannelStatuses(statuses: any[]): Promise<void> {
    if (!statuses || statuses.length === 0) return;
    const db = dbService.database;

    for (const s of statuses) {
      try {
        await db.runAsync(
          `INSERT OR REPLACE INTO ${TABLES.CHANNEL_STATUSES} (
            id, channel_id, author_id, caption, image_urls, video_url, audio_url,
            is_video, is_audio, created_at, expires_at, thumbnail_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            s.id, s.channel_id, s.author_id, s.caption || null,
            s.image_urls ? JSON.stringify(s.image_urls) : null,
            s.video_url || null, s.audio_url || null,
            s.is_video ? 1 : 0, s.is_audio ? 1 : 0,
            s.created_at, s.expires_at || null, s.thumbnail_url || null
          ]
        );
      } catch (err) {
        console.error('Failed to save channel status silently', err);
      }
    }
  }

  async getChannelStatuses(channelId: string, limit: number, offset: number): Promise<any[]> {
    const db = dbService.database;
    try {
      const rows = await db.getAllAsync(
        `SELECT * FROM ${TABLES.CHANNEL_STATUSES} 
         WHERE channel_id = ? AND (expires_at IS NULL OR expires_at >= datetime('now'))
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [channelId, limit, offset]
      );
      return rows.map((row: any) => ({
        ...row,
        image_urls: row.image_urls ? JSON.parse(row.image_urls) : [],
        is_video: row.is_video === 1,
        is_audio: row.is_audio === 1,
      }));
    } catch (err) {
      console.error('Failed to get channel statuses from DB', err);
      return [];
    }
  }

  async getChannelById(channelId: string): Promise<any | null> {
    const db = dbService.database;
    return await db.getFirstAsync(
      `SELECT * FROM ${TABLES.CHANNELS} WHERE id = ?`,
      [channelId]
    );
  }

  async updateChannelSettings(channelId: string, updates: Record<string, any>): Promise<void> {
    const db = dbService.database;
    const keys = Object.keys(updates);
    if (keys.length === 0) return;

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => updates[k]);

    try {
      await db.runAsync(
        `UPDATE ${TABLES.CHANNELS} SET ${setClause} WHERE id = ?`,
        [...values, channelId]
      );
    } catch (err) {
      console.error('Failed to update channel settings', err);
      throw err;
    }
  }

  async getChannelMessages(channelId: string, limit: number, offset: number): Promise<any[]> {
    const db = dbService.database;
    return await db.getAllAsync(
      `SELECT * FROM ${TABLES.CHANNEL_MESSAGES} WHERE channel_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [channelId, limit, offset]
    );
  }

  async saveMessage(msg: any): Promise<void> {
    const db = dbService.database;
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO ${TABLES.CHANNEL_MESSAGES} (
          id, channel_id, sender_id, sender_name, sender_avatar_url, text, media_url, media_type, metadata, created_at, is_pending
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          msg.id, msg.channel_id, msg.sender_id, msg.sender_name, msg.sender_avatar_url,
          msg.text, msg.media_url || null, msg.media_type || 'text', msg.metadata ? JSON.stringify(msg.metadata) : null, msg.created_at, msg.is_pending || 0
        ]
      );
    } catch (err) {
      console.error('Failed to save message to local DB', err);
    }
  }

  async clearChannelMessages(channelId: string): Promise<void> {
    const db = dbService.database;
    try {
      await db.runAsync(
        `DELETE FROM ${TABLES.CHANNEL_MESSAGES} WHERE channel_id = ?`,
        [channelId]
      );
    } catch (err) {
      console.error('Failed to clear channel messages', err);
    }
  }
}

export const channelLocalSource = new ChannelLocalSource();
