import { dbService } from './database';
import { TABLES } from './schema';

export class NativeDB {
  static async upsertDiscoveryFeed(items: any[]) {
    const db = dbService.database;
    for (const item of items) {
      try {
        const sql = `
          INSERT OR REPLACE INTO ${TABLES.DISCOVERY_FEED} (
            id, author_id, author_username, author_avatar_url, 
            channel_id, channel_name, channel_avatar_url, 
            caption, video_url, image_urls, is_video, 
            likes, comments, created_at, widget_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
          String(item.id || ''),
          String(item.author_id || item.authorId || ''),
          String(item.author_username || item.authorUsername || 'member'),
          item.author_avatar_url || item.authorAvatarUrl || null,
          item.channel_id || item.channelId || null,
          item.channel_name || item.channelName || null,
          item.channel_avatar_url || item.channelAvatarUrl || null,
          item.caption || '',
          item.video_url || item.videoUrl || null,
          JSON.stringify(item.image_urls || item.imageUrls || []),
          (item.is_video || item.isVideo) ? 1 : 0,
          Number(item.likes || 0),
          Number(item.comments || 0),
          item.created_at || item.createdAt || new Date().toISOString(),
          item.widget_type || item.widgetType || 'channel_post'
        ];
        
        await db.runAsync(sql, params);
      } catch (error) {
        console.error('🚨 [SQLite Error] upsertDiscoveryFeed item FAILED:', error);
      }
    }
  }

  static async getDiscoveryFeed() {
    const sql = `
      SELECT * FROM ${TABLES.DISCOVERY_FEED} 
      ORDER BY created_at DESC
    `;
    const rows = await dbService.query<any>(sql);
    return rows.map(row => ({
      ...row,
      image_urls: JSON.parse(row.image_urls || '[]'),
      is_video: !!row.is_video
    }));
  }

  static async upsertUser(user: any) {
    const sql = `
      INSERT OR REPLACE INTO ${TABLES.USERS} (
        id, username, display_name, profile_image_url, bio, created_at,
        is_online, last_seen, has_status, status_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      user.id,
      user.username,
      user.display_name || user.displayName,
      user.profile_image_url || user.profileImageUrl,
      user.bio,
      user.created_at || user.createdAt,
      user.is_online ? 1 : 0,
      user.last_seen || user.lastSeen || null,
      user.has_status ? 1 : 0,
      user.status_count || user.statusCount || 0
    ];
    await dbService.execute(sql, params);
  }

  static async updatePresenceData(user: any) {
    const sql = `
      UPDATE ${TABLES.USERS} 
      SET is_online = ?, last_seen = ?, has_status = ?, status_count = ?
      WHERE id = ?
    `;
    const params = [
      user.is_online ? 1 : 0,
      user.last_seen || user.lastSeen || null,
      user.has_status ? 1 : 0,
      user.status_count || user.statusCount || 0,
      user.id
    ];
    await dbService.execute(sql, params);
  }

  static async getUser(id: string) {
    const sql = `SELECT * FROM ${TABLES.USERS} WHERE id = ?`;
    return await dbService.querySingle(sql, [id]);
  }

  // ─── Channels ──────────────────────────────────────────────────────────────

  static async createChannelLocal(channel: any) {
    const db = dbService.database;
    const sql = `
      INSERT INTO ${TABLES.CHANNELS} (
        id, creator_id, name, description, avatar_url, age_restriction,
        visible_to_other_channel_members, visible_to_followed_users, join_method,
        prevent_leaving, country_restrictions, allow_commenting_by, allow_status_posting_by,
        is_discoverable, allow_invitations_by, youtube_channel_id,
        members_count, followers_count, moments_count, messages_count, tags_count,
        likes_count, unread_count, has_active_members, created_at, sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      channel.id,
      channel.creator_id,
      channel.name,
      channel.description || null,
      channel.avatar_url || null,
      channel.age_restriction || 'All Ages',
      channel.visible_to_other_channel_members ? 1 : 0,
      channel.visible_to_followed_users !== false ? 1 : 0,
      channel.join_method || 'invite',
      channel.prevent_leaving ? 1 : 0,
      JSON.stringify(channel.country_restrictions || ['Global']),
      channel.allow_commenting_by || 'all',
      channel.allow_status_posting_by || 'all',
      channel.is_discoverable !== false ? 1 : 0,
      channel.allow_invitations_by || 'all',
      channel.youtube_channel_id || null,
      channel.members_count || 1,
      channel.followers_count || 0,
      channel.moments_count || 0,
      channel.messages_count || 0,
      channel.tags_count || 0,
      channel.likes_count || 0,
      channel.unread_count || 0,
      channel.has_active_members ? 1 : 0,
      channel.created_at || Date.now(),
      channel.sync_status || 'PENDING'
    ];
    await db.runAsync(sql, params);
  }

  static async getChannels() {
    const sql = `
      SELECT * FROM ${TABLES.CHANNELS} 
      ORDER BY created_at DESC
    `;
    const rows = await dbService.query<any>(sql);
    return rows.map(row => ({
      ...row,
      visible_to_other_channel_members: !!row.visible_to_other_channel_members,
      visible_to_followed_users: !!row.visible_to_followed_users,
      prevent_leaving: !!row.prevent_leaving,
      is_discoverable: !!row.is_discoverable,
      has_active_members: !!row.has_active_members,
      country_restrictions: JSON.parse(row.country_restrictions || '["Global"]')
    }));
  }

  // ─── Messaging ─────────────────────────────────────────────────────────────

  static async upsertMessages(channelId: string, messages: any[]) {
    const db = dbService.database;
    for (const msg of messages) {
      try {
        const sql = `
          INSERT OR REPLACE INTO ${TABLES.CHANNEL_MESSAGES} (
            id, channel_id, sender_id, sender_name, sender_avatar_url,
            text, media_url, media_type, reply_to_id, created_at, is_pending
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          msg.id,
          channelId,
          msg.sender_id || msg.senderId,
          msg.sender_name || msg.senderName,
          msg.sender_avatar_url || msg.senderAvatarUrl,
          msg.text || '',
          msg.media_url || msg.mediaUrl || null,
          msg.media_type || msg.mediaType || 'text',
          msg.reply_to_id || msg.replyToId || null,
          msg.created_at || msg.createdAt || new Date().toISOString(),
          msg.is_pending ? 1 : 0
        ];
        await db.runAsync(sql, params);
      } catch (error) {
        console.error('🚨 [NativeDB] upsertMessages item FAILED:', error);
      }
    }
  }

  static async getMessages(channelId: string) {
    const sql = `
      SELECT * FROM ${TABLES.CHANNEL_MESSAGES} 
      WHERE channel_id = ? 
      ORDER BY created_at ASC
    `;
    return await dbService.query<any>(sql, [channelId]);
  }

  // ─── Members ───────────────────────────────────────────────────────────────

  static async upsertMembers(channelId: string, members: any[]) {
    const db = dbService.database;
    for (const member of members) {
      try {
        const sql = `
          INSERT OR REPLACE INTO ${TABLES.CHANNEL_MEMBERS} (
            channel_id, user_id, role, joined_at
          ) VALUES (?, ?, ?, ?)
        `;
        const params = [
          channelId,
          member.user_id || member.userId || member.id,
          member.role || 'member',
          member.joined_at || member.joinedAt || new Date().toISOString()
        ];
        await db.runAsync(sql, params);
      } catch (error) {
        console.error('🚨 [NativeDB] upsertMembers item FAILED:', error);
      }
    }
  }

  static async getMembers(channelId: string) {
    const sql = `
      SELECT m.*, u.username, u.display_name, u.profile_image_url 
      FROM ${TABLES.CHANNEL_MEMBERS} m
      LEFT JOIN ${TABLES.USERS} u ON m.user_id = u.id
      WHERE m.channel_id = ?
    `;
    return await dbService.query<any>(sql, [channelId]);
  }

  // ─── Statuses & Moments ────────────────────────────────────────────────────

  static async upsertStatuses(statuses: any[]) {
    const db = dbService.database;
    for (const status of statuses) {
      try {
        const sql = `
          INSERT OR REPLACE INTO ${TABLES.STATUSES} (
            id, author_id, username, profile_image_url, caption,
            image_urls, video_url, thumbnail_url, audio_url,
            is_video, is_audio, comments_count, created_at, 
            expires_at, channel_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          status.id,
          status.author_id || status.authorId,
          status.username || 'member',
          status.profile_image_url || status.profileImageUrl,
          status.caption || '',
          JSON.stringify(status.image_urls || status.imageUrls || []),
          status.video_url || status.videoUrl || null,
          status.thumbnail_url || status.thumbnailUrl || null,
          status.audio_url || status.audioUrl || null,
          status.is_video ? 1 : 0,
          status.is_audio ? 1 : 0,
          status.comments_count || 0,
          status.created_at || status.createdAt || new Date().toISOString(),
          status.expires_at || status.expiresAt || null,
          status.channel_id || status.channelId || null
        ];
        await db.runAsync(sql, params);
      } catch (error) {
        console.error('🚨 [NativeDB] upsertStatuses item FAILED:', error);
      }
    }
  }

  static async getChannelMoments(channelId: string) {
    const sql = `
      SELECT * FROM ${TABLES.STATUSES} 
      WHERE channel_id = ? 
      ORDER BY created_at DESC
    `;
    const rows = await dbService.query<any>(sql, [channelId]);
    return rows.map(row => ({
      ...row,
      image_urls: JSON.parse(row.image_urls || '[]'),
      is_video: !!row.is_video,
      is_audio: !!row.is_audio
    }));
  }

  // ─── Profile Media (Photos, Videos, Music) ─────────────────────────────────

  static async upsertProfileMedia(items: any[], mediaType: string) {
    const db = dbService.database;
    for (const item of items) {
      try {
        const sql = `
          INSERT OR REPLACE INTO ${TABLES.PROFILE_MEDIA} (
            id, author_id, media_type, caption, video_url, audio_url,
            image_urls, thumbnail_urls, likes_count, comments_count, created_at, metadata
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          String(item.id),
          String(item.author_id),
          mediaType,
          item.caption || '',
          item.video_url || null,
          item.audio_url || null,
          JSON.stringify(item.image_urls || []),
          JSON.stringify(item.thumbnail_urls || []),
          Number(item.likes_count || 0),
          Number(item.comments_count || 0),
          item.created_at || new Date().toISOString(),
          JSON.stringify(item.metadata || {})
        ];
        await db.runAsync(sql, params);
      } catch (error) {
        console.error('🚨 [NativeDB] upsertProfileMedia item FAILED:', error);
      }
    }
  }

  static async getProfileMedia(authorId: string, mediaType: string) {
    const sql = `
      SELECT * FROM ${TABLES.PROFILE_MEDIA} 
      WHERE author_id = ? AND media_type = ?
      ORDER BY created_at DESC
    `;
    const rows = await dbService.query<any>(sql, [authorId, mediaType]);
    return rows.map(row => ({
      ...row,
      image_urls: JSON.parse(row.image_urls || '[]'),
      thumbnail_urls: JSON.parse(row.thumbnail_urls || '[]'),
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }
}
