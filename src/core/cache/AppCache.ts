import { MMKV } from 'react-native-mmkv';

export const cacheStorage = new MMKV({ id: 'app-cache' });

export class AppCache {
  /**
   * Stores data in MMKV with an optional expiration time in minutes.
   */
  static set(key: string, value: any, ttlMinutes?: number) {
    const payload = {
      data: value,
      expiresAt: ttlMinutes ? Date.now() + ttlMinutes * 60 * 1000 : null,
    };
    cacheStorage.set(key, JSON.stringify(payload));
  }

  /**
   * Retrieves data from MMKV. Returns null if expired or missing.
   */
  static get<T>(key: string): T | null {
    const str = cacheStorage.getString(key);
    if (!str) return null;

    try {
      const payload = JSON.parse(str);
      if (payload.expiresAt && Date.now() > payload.expiresAt) {
        cacheStorage.delete(key);
        return null;
      }
      return payload.data as T;
    } catch {
      return null;
    }
  }

  static delete(key: string) {
    cacheStorage.delete(key);
  }

  static clearAll() {
    cacheStorage.clearAll();
  }
}
