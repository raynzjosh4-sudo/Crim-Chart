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
            likes, comments, created_at, widget_type, views_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          item.widget_type || item.widgetType || 'channel_post',
          Number(item.views_count || item.viewsCount || 0)
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

  static async saveBoxItems(boxId: string, items: any[]) {
    const db = dbService.database;
    try {
      try {
        await db.runAsync(`ALTER TABLE ${TABLES.BOX_ITEMS} ADD COLUMN comments_count INTEGER DEFAULT 0`);
        await db.runAsync(`ALTER TABLE ${TABLES.BOX_ITEMS} ADD COLUMN views_count INTEGER DEFAULT 0`);
        await db.runAsync(`ALTER TABLE ${TABLES.BOX_ITEMS} ADD COLUMN post_type TEXT`);
        await db.runAsync(`ALTER TABLE ${TABLES.BOX_ITEMS} ADD COLUMN aspect_ratio REAL`);
      } catch (e) {
        // columns likely already exist
      }

      // First, clear the existing cache for this box to easily refresh the top 10
      await db.runAsync(`DELETE FROM ${TABLES.BOX_ITEMS} WHERE box_id = ?`, [boxId]);

      for (const item of items) {
        const sql = `
          INSERT INTO ${TABLES.BOX_ITEMS} (
            id, box_id, post_id, likes_count, dislikes_count, added_at,
            added_by_id, added_by_name, added_by_avatar,
            caption, media_url, thumbnail_url, is_video,
            author_id, author_name, author_avatar, comments_count, views_count, post_type, aspect_ratio
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          item.id,
          item.box_id,
          item.post_id,
          item.likes,
          item.dislikes,
          item.addedAt,
          item.addedBy?.id || null,
          item.addedBy?.name || null,
          item.addedBy?.avatarUrl || null,
          item.post?.caption || null,
          item.post?.mediaUrl || null,
          item.post?.thumbnailUrl || null,
          item.post?.isVideo ? 1 : 0,
          item.post?.authorId || null,
          item.post?.authorName || null,
          item.post?.authorAvatar || null,
          item.post?.commentsCount || 0,
          item.post?.viewsCount || 0,
          item.post?.postType || null,
          item.post?.aspectRatio || null
        ];
        await db.runAsync(sql, params);
      }
    } catch (error) {
      console.error('🚨 [SQLite Error] saveBoxItems FAILED:', error);
    }
  }

  static async getBoxItems(boxId: string) {
    const sql = `
      SELECT * FROM ${TABLES.BOX_ITEMS} 
      WHERE box_id = ?
      ORDER BY added_at DESC
    `;
    const rows = await dbService.query<any>(sql, [boxId]);
    return rows;
  }

  static async upsertUser(user: any) {
    const sql = `
      INSERT OR REPLACE INTO ${TABLES.USERS} (
        id, username, display_name, profile_image_url, bio, crown_title, created_at,
        is_online, last_seen, has_status, status_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const createdAtVal = user.created_at || user.createdAt;
    const lastSeenVal = user.last_seen || user.lastSeen;

    const params = [
      user.id || null,
      user.username || null,
      user.display_name || user.displayName || null,
      user.profile_image_url || user.profileImageUrl || null,
      user.bio || null,
      user.crown_title || user.crownTitle || null,
      createdAtVal instanceof Date ? createdAtVal.toISOString() : (createdAtVal || null),
      user.is_online ? 1 : 0,
      lastSeenVal instanceof Date ? lastSeenVal.toISOString() : (lastSeenVal || null),
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

  static async upsertUserConnectionStats(stats: any) {
    const sql = `
      INSERT OR REPLACE INTO ${TABLES.USER_CONNECTION_STATS} (
        user_id, rel_sent_count, rel_accepted_count, relationship_status,
        preferred_countries, preferred_age_ranges, show_status_circle,
        show_status_text, show_country_pref, show_age_pref
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      stats.user_id || stats.userId,
      stats.rel_sent_count || stats.relSentCount || 0,
      stats.rel_accepted_count || stats.relAcceptedCount || 0,
      stats.relationship_status || stats.relationshipStatus || 'Unknown',
      typeof stats.preferred_countries === 'string' ? stats.preferred_countries : JSON.stringify(stats.preferred_countries || stats.preferredCountries || []),
      typeof stats.preferred_age_ranges === 'string' ? stats.preferred_age_ranges : JSON.stringify(stats.preferred_age_ranges || stats.preferredAgeRanges || []),
      stats.show_status_circle !== false ? 1 : 0,
      stats.show_status_text !== false ? 1 : 0,
      stats.show_country_pref !== false ? 1 : 0,
      stats.show_age_pref !== false ? 1 : 0
    ];
    await dbService.execute(sql, params);
  }

  static async getUserConnectionStats(userId: string) {
    const sql = `SELECT * FROM ${TABLES.USER_CONNECTION_STATS} WHERE user_id = ?`;
    return await dbService.querySingle<any>(sql, [userId]);
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
            text, media_url, media_type, reply_to_id, created_at, is_pending, views_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          msg.is_pending ? 1 : 0,
          msg.views_count || msg.viewsCount || 0
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
            expires_at, channel_id, views_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          status.channel_id || status.channelId || null,
          status.views_count || status.viewsCount || 0
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
            image_urls, thumbnail_urls, likes_count, comments_count, created_at, metadata, views_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          JSON.stringify(item.metadata || {}),
          Number(item.views_count || item.viewsCount || 0)
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

  // ─── Boxes ─────────────────────────────────────────────────────────────────

  static async upsertBoxes(boxes: any[]) {
    const db = dbService.database;
    for (const box of boxes) {
      try {
        const sql = `
          INSERT OR REPLACE INTO ${TABLES.BOXES} (
            id, owner_id, title, description, box_type, metadata,
            is_public, allow_submissions, age_restriction, country_restrictions,
            visible_to_followed_users, created_at, views_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          box.id,
          box.owner_id || box.ownerId,
          box.title,
          box.description || null,
          box.box_type || box.boxType || 'voting',
          typeof box.metadata === 'string' ? box.metadata : JSON.stringify(box.metadata || {}),
          (box.is_public ?? true) ? 1 : 0,
          (box.allow_submissions ?? true) ? 1 : 0,
          box.age_restriction || 'All Ages',
          JSON.stringify(box.country_restrictions || ['Global']),
          (box.visible_to_followed_users ?? true) ? 1 : 0,
          box.created_at || box.createdAt || new Date().toISOString(),
          box.views_count || box.viewsCount || 0
        ];
        await db.runAsync(sql, params);
      } catch (error) {
        console.error('🚨 [NativeDB] upsertBoxes item FAILED:', error);
      }
    }
  }

  static async getBoxes(ownerId: string) {
    const sql = `
      SELECT * FROM ${TABLES.BOXES} 
      WHERE owner_id = ?
      ORDER BY created_at DESC
    `;
    const rows = await dbService.query<any>(sql, [ownerId]);
    return rows.map(row => ({
      ...row,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata || '{}') : row.metadata,
      country_restrictions: typeof row.country_restrictions === 'string' ? JSON.parse(row.country_restrictions || '["Global"]') : row.country_restrictions,
      is_public: !!row.is_public,
      allow_submissions: !!row.allow_submissions,
      visible_to_followed_users: !!row.visible_to_followed_users
    }));
  }

  static async getBox(boxId: string) {
    const sql = `
      SELECT * FROM ${TABLES.BOXES} 
      WHERE id = ?
    `;
    const row = await dbService.querySingle<any>(sql, [boxId]);
    if (!row) return null;
    return {
      ...row,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata || '{}') : row.metadata,
      country_restrictions: typeof row.country_restrictions === 'string' ? JSON.parse(row.country_restrictions || '["Global"]') : row.country_restrictions,
      is_public: !!row.is_public,
      allow_submissions: !!row.allow_submissions,
      visible_to_followed_users: !!row.visible_to_followed_users
    };
  }

  static async deleteBox(boxId: string) {
    const db = dbService.database;
    try {
      const sql = `DELETE FROM ${TABLES.BOXES} WHERE id = ?`;
      await db.runAsync(sql, [boxId]);
    } catch (error) {
      console.error('🚨 [NativeDB] deleteBox FAILED:', error);
    }
  }

  static async updatePostInteraction(postId: string, updates: { isLiked?: boolean; likesCount?: number; viewsCount?: number; downloadsCount?: number }) {
    const db = dbService.database;
    
    // Build dynamic SQL
    const sets: string[] = [];
    const values: any[] = [];
    
    // Note: Local DISCOVERY_FEED schema does not have 'is_liked' right now.
    // We only update 'likes' and 'views_count'.
    if (updates.likesCount !== undefined) {
      sets.push('likes = ?');
      values.push(updates.likesCount);
    }
    if (updates.viewsCount !== undefined) {
      sets.push('views_count = ?');
      values.push(updates.viewsCount);
    }
    if (updates.downloadsCount !== undefined) {
      sets.push('downloads_count = ?');
      values.push(updates.downloadsCount);
    }

    if (sets.length === 0) return;

    values.push(postId);
    const sql = `UPDATE ${TABLES.DISCOVERY_FEED} SET ${sets.join(', ')} WHERE id = ?`;

    try {
      await db.runAsync(sql, values);
    } catch (e) {
      console.error('Error updating NativeDB post interaction:', e);
    }
  }

  static async upsertComments(comments: any[]) {
    const sql = `
      INSERT OR REPLACE INTO ${TABLES.COMMENTS} (
        id, post_id, author_id, author_username, author_avatar_url,
        text, media_url, media_type, reply_to_id, created_at, likes_count, is_pending
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    for (const comment of comments) {
      try {
        const params = [
          comment.id,
          comment.post_id || comment.postId,
          comment.author_id || comment.authorId,
          comment.author_username || comment.authorUsername || 'User',
          comment.author_avatar_url || comment.authorAvatarUrl || null,
          comment.text || '',
          comment.media_url || comment.mediaUrl || null,
          comment.media_type || comment.mediaType || 'text',
          comment.reply_to_id || comment.replyToId || null,
          comment.created_at || comment.createdAt || new Date().toISOString(),
          Number(comment.likes_count || comment.likesCount || 0),
          comment.is_pending ? 1 : 0
        ];
        await dbService.execute(sql, params);
      } catch (err) {
        console.error('🚨 [NativeDB] upsertComment FAILED:', err);
      }
    }
  }

  static async getComments(postId: string) {
    try {
      if (!postId) return [];
      const rows = await dbService.query<any>(`
        SELECT * FROM ${TABLES.COMMENTS} 
        WHERE post_id = ? 
        ORDER BY created_at DESC
      `, [String(postId)]);
      return rows.map(r => ({ ...r, is_pending: r.is_pending === 1 }));
    } catch (err) {
      console.error('🚨 [NativeDB] getComments FAILED:', err);
      return [];
    }
  }

  static async getPendingComments() {
    try {
      const rows = await dbService.query<any>(`
        SELECT * FROM ${TABLES.COMMENTS} 
        WHERE is_pending = 1 
        ORDER BY created_at ASC
      `);
      return rows.map(r => ({ ...r, is_pending: r.is_pending === 1 }));
    } catch (err) {
      console.error('🚨 [NativeDB] getPendingComments FAILED:', err);
      return [];
    }
  }

  static async markCommentSynced(commentId: string) {
    try {
      const db = dbService.database;
      await db.runAsync(`UPDATE ${TABLES.COMMENTS} SET is_pending = 0 WHERE id = ?`, [commentId]);
    } catch (err) {
      console.error('🚨 [NativeDB] markCommentSynced FAILED:', err);
    }
  }

  static async deleteComment(commentId: string) {
    const db = dbService.database;
    try {
      await db.runAsync(`DELETE FROM ${TABLES.COMMENTS} WHERE id = ?`, [commentId]);
    } catch (err) {
      console.error('🚨 [NativeDB] deleteComment FAILED:', err);
    }
  }

  // ─── Box Offline Support ───────────────────────────────────────────────────

  static async saveBoxMembers(boxId: string, members: any[]) {
    const db = dbService.database;
    try {
      await db.runAsync(`DELETE FROM ${TABLES.BOX_MEMBERS} WHERE box_id = ?`, [boxId]);
      for (const member of members) {
        const sql = `
          INSERT INTO ${TABLES.BOX_MEMBERS} (
            box_id, user_id, name, avatar_url, interaction_type, last_interaction_at
          ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
          boxId,
          member.id,
          member.name || null,
          member.avatarUrl || null,
          member.interactionType || null,
          member.lastInteractionAt || null
        ];
        await db.runAsync(sql, params);
      }
    } catch (error) {
      console.error('🚨 [SQLite Error] saveBoxMembers FAILED:', error);
    }
  }

  static async getBoxMembers(boxId: string) {
    const sql = `
      SELECT * FROM ${TABLES.BOX_MEMBERS} 
      WHERE box_id = ?
      ORDER BY last_interaction_at DESC
    `;
    const rows = await dbService.query<any>(sql, [boxId]);
    return rows.map(row => ({
      id: row.user_id,
      name: row.name,
      avatarUrl: row.avatar_url,
      interactionType: row.interaction_type,
      lastInteractionAt: row.last_interaction_at
    }));
  }

  static async saveTrendingBoxItems(boxId: string, items: any[]) {
    const db = dbService.database;
    try {
      try {
        await db.runAsync(`ALTER TABLE ${TABLES.TRENDING_BOX_ITEMS} ADD COLUMN video_url TEXT`);
        await db.runAsync(`ALTER TABLE ${TABLES.TRENDING_BOX_ITEMS} ADD COLUMN is_audio INTEGER DEFAULT 0`);
        await db.runAsync(`ALTER TABLE ${TABLES.TRENDING_BOX_ITEMS} ADD COLUMN is_short INTEGER DEFAULT 0`);
      } catch (e) {
        // columns likely already exist
      }

      await db.runAsync(`DELETE FROM ${TABLES.TRENDING_BOX_ITEMS} WHERE box_id = ?`, [boxId]);
      for (const item of items) {
        const sql = `
          INSERT OR REPLACE INTO ${TABLES.TRENDING_BOX_ITEMS} (
            id, box_id, title, artist, thumbnail_url, audio_url, video_url, is_audio, is_short, likes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          item.id,
          boxId,
          item.title || null,
          item.artist || null,
          item.thumbnailUrl || null,
          item.audioUrl || null,
          item.videoUrl || null,
          item.isAudio ? 1 : 0,
          item.isShort ? 1 : 0,
          item.likes || 0
        ];
        await db.runAsync(sql, params);
      }
    } catch (error) {
      console.error('🚨 [SQLite Error] saveTrendingBoxItems FAILED:', error);
    }
  }

  static async getTrendingBoxItems(boxId: string) {
    const sql = `
      SELECT * FROM ${TABLES.TRENDING_BOX_ITEMS} 
      WHERE box_id = ?
      ORDER BY likes DESC
    `;
    const rows = await dbService.query<any>(sql, [boxId]);
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      thumbnailUrl: row.thumbnail_url,
      audioUrl: row.audio_url,
      videoUrl: row.video_url || '',
      isAudio: !!row.is_audio,
      isShort: !!row.is_short,
      likes: row.likes
    }));
  }

  // ─── Main Feed Cache ───────────────────────────────────────────────────────

  /**
   * Replaces the entire local main feed cache with the freshly loaded page-0
   * items. Only called on a full reset (pull-to-refresh / first load).
   */
  static async upsertMainFeed(items: any[]) {
    const db = dbService.database;
    try {
      // Clear old cached feed first so we never accumulate stale data
      await db.runAsync(`DELETE FROM ${TABLES.MAIN_FEED}`);

      for (const item of items) {
        const sql = `
          INSERT OR REPLACE INTO ${TABLES.MAIN_FEED} (
            id, entity_type, entity_id, source_type, created_at, prefetched_data
          ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
          String(item.id),
          item.entity_type || '',
          item.entity_id || '',
          item.source_type || '',
          item.created_at || new Date().toISOString(),
          item.prefetchedData ? JSON.stringify(item.prefetchedData) : null,
        ];
        await dbService.execute(sql, params);
      }
    } catch (error) {
      console.error('🚨 [NativeDB] upsertMainFeed FAILED:', error);
    }
  }

  /**
   * Returns all locally cached main feed items, ordered newest-first.
   */
  static async getMainFeed(): Promise<any[]> {
    try {
      const sql = `
        SELECT * FROM ${TABLES.MAIN_FEED}
        ORDER BY created_at DESC
      `;
      const rows = await dbService.query<any>(sql);
      return rows.map(row => ({
        id: row.id,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        source_type: row.source_type,
        created_at: row.created_at,
        prefetchedData: row.prefetched_data ? JSON.parse(row.prefetched_data) : null,
      }));
    } catch (error) {
      console.error('🚨 [NativeDB] getMainFeed FAILED:', error);
      return [];
    }
  }

  static async saveMusicFeed(tracks: any[], reset: boolean = true) {
    try {
      if (reset) {
        await dbService.execute(`DELETE FROM ${TABLES.MUSIC_FEED}`);
      }

      for (const track of tracks) {
        const sql = `
          INSERT OR REPLACE INTO ${TABLES.MUSIC_FEED} (
            id, title, artist, coverUrl, audioUrl, likesCount, commentsCount,
            viewsCount, downloadsCount, lyrics, sourceTable, caption, created_at, owner_id,
            owner_name, owner_avatarUrl, owner_crownTitle, fetched_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          String(track.id || ''),
          track.title ?? '',
          track.artist ?? '',
          track.coverUrl ?? '',
          track.audioUrl ?? '',
          Number(track.likesCount) || 0,
          Number(track.commentsCount) || 0,
          Number(track.viewsCount) || 0,
          Number(track.downloadsCount) || 0,
          track.lyrics ?? '',
          track.sourceTable ?? 'posts',
          track.caption ?? '',
          track.createdAt ?? '',
          track.owner?.id ?? '',
          track.owner?.name ?? '',
          track.owner?.avatarUrl ?? '',
          track.owner?.crownTitle ?? '',
          Date.now()
        ];
        await dbService.execute(sql, params);
      }
    } catch (error) {
      console.error('🚨 [NativeDB] saveMusicFeed FAILED:', error);
    }
  }

  static async getMusicFeed(limit: number = 10, offset: number = 0): Promise<any[]> {
    try {
      const sql = `
        SELECT * FROM ${TABLES.MUSIC_FEED}
        ORDER BY fetched_at ASC
        LIMIT ? OFFSET ?
      `;
      const rows = await dbService.query<any>(sql, [limit, offset]);
      return rows.map(row => ({
        id: row.id,
        title: row.title,
        artist: row.artist,
        coverUrl: row.coverUrl,
        audioUrl: row.audioUrl,
        likesCount: row.likesCount,
        commentsCount: row.commentsCount,
        viewsCount: row.viewsCount,
        downloadsCount: row.downloadsCount,
        lyrics: row.lyrics,
        sourceTable: row.sourceTable,
        caption: row.caption,
        createdAt: row.created_at,
        owner: {
          id: row.owner_id,
          name: row.owner_name,
          avatarUrl: row.owner_avatarUrl,
          crownTitle: row.owner_crownTitle,
        }
      }));
    } catch (error) {
      console.error('🚨 [NativeDB] getMusicFeed FAILED:', error);
      return [];
    }
  }
}
