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
