import { dbService } from '@/core/db/database';
import { TABLES } from '@/core/db/schema';
import { ChannelModel } from '@/channel/models/ChannelModel';

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
            join_method, prevent_leaving, country_restrictions, allow_commenting_by, 
            allow_status_posting_by, is_discoverable, allow_invitations_by, 
            youtube_channel_id, members_count, followers_count, moments_count, 
            messages_count, tags_count, likes_count, unread_count, has_active_members, 
            created_at, sync_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            channel.id, channel.creatorId || null, channel.title, channel.description || null, 
            channel.imageUrl || null, channel.ageRestriction || 'All Ages',
            channel.visibleToOtherChannelMembers ? 1 : 0, channel.visibleToFollowedUsers ? 1 : 0,
            channel.joinMethod, channel.preventLeaving ? 1 : 0, JSON.stringify(channel.countryRestrictions), 
            channel.allowCommentingBy, channel.allowStatusPostingBy, channel.isDiscoverable ? 1 : 0, 
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
}

export const channelLocalSource = new ChannelLocalSource();
