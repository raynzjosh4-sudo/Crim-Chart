import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { feedStatusesLocalSource } from '../data/FeedStatusesLocalSource';
import { feedStatusesRemoteSource } from '../data/FeedStatusesRemoteSource';
import { FeedStatusItem } from '../models/FeedStatusItem';

/**
 * Offline-first hook for the followed-user status ring.
 *
 * Strategy:
 *  1. Instantly emit cached statuses from SQLite (no network wait).
 *  2. Fetch fresh data from Supabase RPC in the background.
 *  3. Upsert new rows, delete expired rows, then re-emit.
 *
 * Safe to call with an undefined userId — returns empty and does nothing.
 */
export function useFeedStatuses(userId: string | undefined) {
  const [statuses, setStatuses] = useState<FeedStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFromCache = useCallback(async () => {
    try {
      const cached = await feedStatusesLocalSource.getActive();
      if (cached.length > 0) {
        setStatuses(cached);
        setLoading(false);
      }
    } catch (e) {
      console.warn('[useFeedStatuses] Cache read failed:', e);
    }
  }, []);

  const syncFromRemote = useCallback(async () => {
    if (!userId) return;
    try {
      const fresh = await feedStatusesRemoteSource.fetch(userId);

      // Update cache
      if (Platform.OS !== 'web') {
        await feedStatusesLocalSource.upsertAll(fresh);
        await feedStatusesLocalSource.deleteExpired();

        // Re-read from cache to get consistent sorted view
        const updated = await feedStatusesLocalSource.getActive();
        setStatuses(updated);
      } else {
        setStatuses(fresh);
      }
      setError(null);
    } catch (e) {
      console.error('[useFeedStatuses] Remote sync failed:', e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    // Step 1: show cache immediately
    loadFromCache().then(() => {
      // Step 2: sync remote in background
      syncFromRemote();
    });

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleStatusPosted = () => syncFromRemote();
      window.addEventListener('status_posted', handleStatusPosted);
      return () => window.removeEventListener('status_posted', handleStatusPosted);
    }
  }, [userId, loadFromCache, syncFromRemote]);

  return { statuses, loading, error, refresh: syncFromRemote };
}
