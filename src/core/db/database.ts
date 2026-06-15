import * as SQLite from 'expo-sqlite';
import { SCHEMA } from './schema';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    if (this.db) return;
    
    try {
      this.db = await SQLite.openDatabaseAsync('crimchart.db');
      await this.db.execAsync(SCHEMA);
      try {
        await this.db.execAsync(`ALTER TABLE channels ADD COLUMN age_restriction TEXT DEFAULT 'All Ages'`);
      } catch (e) {
        // Ignore if column already exists
      }
      try {
        await this.db.execAsync(`ALTER TABLE users ADD COLUMN crown_title TEXT`);
      } catch (e) {}

      // Migrations for new views/downloads columns
      try { await this.db.execAsync(`ALTER TABLE profile_media ADD COLUMN views_count INTEGER DEFAULT 0`); } catch (e) {}
      try { await this.db.execAsync(`ALTER TABLE discovery_feed ADD COLUMN views_count INTEGER DEFAULT 0`); } catch (e) {}
      try { await this.db.execAsync(`ALTER TABLE discovery_feed ADD COLUMN downloads_count INTEGER DEFAULT 0`); } catch (e) {}
      try { await this.db.execAsync(`ALTER TABLE boxes ADD COLUMN views_count INTEGER DEFAULT 0`); } catch (e) {}
      try { await this.db.execAsync(`ALTER TABLE channel_moments ADD COLUMN views_count INTEGER DEFAULT 0`); } catch (e) {}

      console.log('✅ [SQLite] Database initialized successfully');
    } catch (error) {
      console.error('🚨 [SQLite Error] Initialization failed:', error);
      throw error;
    }
  }

  get database() {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  async execute(sql: string, params: any[] = []) {
    if (!this.db) await this.init();
    return await this.db!.runAsync(sql, params);
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) await this.init();
    return await this.db!.getAllAsync<T>(sql, params);
  }

  async querySingle<T>(sql: string, params: any[] = []): Promise<T | null> {
    if (!this.db) await this.init();
    return await this.db!.getFirstAsync<T>(sql, params);
  }
}

export const dbService = new DatabaseService();
