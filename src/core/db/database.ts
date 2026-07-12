import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { SCHEMA } from './schema';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init() {
    if (Platform.OS === 'web') return;
    if (this.db) return;
    if (this.initPromise) {
      await this.initPromise;
      return;
    }
    
    this.initPromise = (async () => {
      try {
        // Renamed to v2 to bypass filesystem corruption from previous crashes
        const _db = await SQLite.openDatabaseAsync('crimchart_v2.db');
        await _db.execAsync(SCHEMA);
      try {
        await _db.execAsync(`ALTER TABLE channels ADD COLUMN age_restriction TEXT DEFAULT 'All Ages'`);
      } catch (e) {}
      try {
        await _db.execAsync(`ALTER TABLE users ADD COLUMN crown_title TEXT`);
      } catch (e) {}
      try {
        await _db.execAsync(`ALTER TABLE users ADD COLUMN downloads_count INTEGER DEFAULT 0`);
      } catch (e) {}

      // Migrations for user_connection_stats
      try { await _db.execAsync(`ALTER TABLE user_connection_stats ADD COLUMN preferred_countries TEXT DEFAULT '[]'`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE user_connection_stats ADD COLUMN preferred_age_ranges TEXT DEFAULT '[]'`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE user_connection_stats ADD COLUMN show_status_circle INTEGER DEFAULT 1`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE user_connection_stats ADD COLUMN show_status_text INTEGER DEFAULT 1`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE user_connection_stats ADD COLUMN show_country_pref INTEGER DEFAULT 1`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE user_connection_stats ADD COLUMN show_age_pref INTEGER DEFAULT 1`); } catch (e) {}

      // Migrations for new channel settings columns
      try { await _db.execAsync(`ALTER TABLE channels ADD COLUMN allow_posting_by TEXT DEFAULT 'all'`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE channels ADD COLUMN allow_chatting_by TEXT DEFAULT 'all'`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE channel_members ADD COLUMN can_chat INTEGER DEFAULT 1`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE channels ADD COLUMN invite_link TEXT`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE channels ADD COLUMN category TEXT`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE channels ADD COLUMN rules_text TEXT`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE channels ADD COLUMN is_paid INTEGER DEFAULT 0`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE channels ADD COLUMN subscription_price REAL`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE channels ADD COLUMN pinned_message_id TEXT`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE channels ADD COLUMN is_youtube_claimed INTEGER DEFAULT 0`); } catch (e) {}

      // Migrations for new views/downloads columns
      try { await _db.execAsync(`ALTER TABLE profile_media ADD COLUMN views_count INTEGER DEFAULT 0`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE discovery_feed ADD COLUMN views_count INTEGER DEFAULT 0`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE discovery_feed ADD COLUMN downloads_count INTEGER DEFAULT 0`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE boxes ADD COLUMN views_count INTEGER DEFAULT 0`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE channel_moments ADD COLUMN views_count INTEGER DEFAULT 0`); } catch (e) {}
      
      // Migrations for channel messages
      try { await _db.execAsync(`ALTER TABLE channel_messages ADD COLUMN metadata TEXT`); } catch (e) {}

      // Migration: cached_feed_statuses table for offline-first status ring
      try {
        await _db.execAsync(`
          CREATE TABLE IF NOT EXISTS cached_feed_statuses (
            id TEXT PRIMARY KEY,
            author_id TEXT NOT NULL,
            author_name TEXT,
            author_avatar_url TEXT,
            image_urls TEXT,
            video_url TEXT,
            audio_url TEXT,
            thumbnail_url TEXT,
            caption TEXT,
            is_video INTEGER DEFAULT 0,
            is_audio INTEGER DEFAULT 0,
            created_at INTEGER,
            expires_at INTEGER,
            fetched_at INTEGER NOT NULL,
            metadata TEXT
          )
        `);
        await _db.execAsync(`CREATE INDEX IF NOT EXISTS idx_cfs_expires ON cached_feed_statuses (expires_at)`);
        await _db.execAsync(`CREATE INDEX IF NOT EXISTS idx_cfs_author  ON cached_feed_statuses (author_id)`);
        try {
          await _db.execAsync(`ALTER TABLE cached_feed_statuses ADD COLUMN metadata TEXT`);
        } catch (e) {}
      } catch (e) {}

      // Migrations for box_items extended columns
      try { await _db.execAsync(`ALTER TABLE box_items ADD COLUMN comments_count INTEGER DEFAULT 0`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE box_items ADD COLUMN views_count INTEGER DEFAULT 0`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE box_items ADD COLUMN post_type TEXT`); } catch (e) {}
      try { await _db.execAsync(`ALTER TABLE box_items ADD COLUMN aspect_ratio REAL`); } catch (e) {}

      // Migration: music_feed table
      try {
        await _db.execAsync(`
          CREATE TABLE IF NOT EXISTS music_feed (
            id TEXT PRIMARY KEY,
            title TEXT,
            artist TEXT,
            coverUrl TEXT,
            audioUrl TEXT,
            likesCount INTEGER DEFAULT 0,
            commentsCount INTEGER DEFAULT 0,
            viewsCount INTEGER DEFAULT 0,
            downloadsCount INTEGER DEFAULT 0,
            lyrics TEXT,
            sourceTable TEXT,
            caption TEXT,
            category TEXT,
            created_at TEXT,
            owner_id TEXT,
            owner_name TEXT,
            owner_avatarUrl TEXT,
            owner_crownTitle TEXT,
            fetched_at INTEGER NOT NULL
          )
        `);
        // Add columns if they don't exist yet (for devices that already ran the creation without them)
        try { await _db.execAsync(`ALTER TABLE music_feed ADD COLUMN caption TEXT`); } catch (e) {}
        try { await _db.execAsync(`ALTER TABLE music_feed ADD COLUMN category TEXT`); } catch (e) {}
        try { await _db.execAsync(`ALTER TABLE music_feed ADD COLUMN created_at TEXT`); } catch (e) {}
      } catch (e) {}

      // Migration: drafts table
      try {
        await _db.execAsync(`
          CREATE TABLE IF NOT EXISTS drafts (
            id TEXT PRIMARY KEY,
            text TEXT,
            media TEXT,
            post_type TEXT,
            created_at TEXT
          )
        `);
      } catch (e) {}

      this.db = _db;
      console.log('✅ [SQLite] Database initialized successfully');
      } catch (error) {
        console.error('🚨 [SQLite Error] Initialization failed:', error);
        this.initPromise = null;
        throw error;
      }
    })();
    await this.initPromise;
  }

  get database() {
    if (Platform.OS === 'web') {
      return {
        runAsync: async () => {},
        getAllAsync: async () => [],
        getFirstAsync: async () => null,
        execAsync: async () => {},
      } as any;
    }
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  async execute(sql: string, params: any[] = []) {
    if (Platform.OS === 'web') return;
    if (!this.db) await this.init();
    const safeParams = params.map(p => p === undefined ? null : p);
    return await this.db!.runAsync(sql, ...safeParams);
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (Platform.OS === 'web') return [];
    if (!this.db) await this.init();
    const safeParams = params.map(p => p === undefined ? null : p);
    return await this.db!.getAllAsync<T>(sql, ...safeParams);
  }

  async querySingle<T>(sql: string, params: any[] = []): Promise<T | null> {
    if (Platform.OS === 'web') return null;
    if (!this.db) await this.init();
    const safeParams = params.map(p => p === undefined ? null : p);
    return await this.db!.getFirstAsync<T>(sql, ...safeParams);
  }
}

export const dbService = new DatabaseService();
