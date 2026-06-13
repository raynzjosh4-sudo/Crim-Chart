import { useEffect } from 'react';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useProfileCacheStore, CachedProfile } from '@/core/store/useProfileCacheStore';
import { NativeDB } from '@/core/db/NativeDB';

export function usePresenceSyncWorker() {
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      const state = useProfileCacheStore.getState();
      const idsToSync = Array.from(state.requestedUserIds);

      if (idsToSync.length === 0) return;

      // Clear the queue so we don't double fetch the same IDs
      state.clearRequestedSyncs(idsToSync);

      try {
        // Chunk requests to avoid hitting URL query length limits
        const chunkSize = 50;
        const results: CachedProfile[] = [];

        for (let i = 0; i < idsToSync.length; i += chunkSize) {
          const chunk = idsToSync.slice(i, i + chunkSize);
          
          // Only fetch the bare minimum presence/status data
          const { data, error } = await supabase
            .from('profiles')
            .select('id, is_online, last_seen, has_status, status_count')
            .in('id', chunk);

          if (error) {
            console.error('[PresenceSyncWorker] Supabase error:', error);
            // Re-queue failed IDs for the next cycle
            chunk.forEach(id => state.requestSync(id));
            continue;
          }

          if (data) {
            const now = Date.now();
            for (const row of data) {
              const safeStatusCount = Math.max(row.status_count || 0, 0);
              const cached: CachedProfile = {
                id: row.id,
                isOnline: !!row.is_online,
                lastSeen: row.last_seen,
                hasStatus: safeStatusCount > 0,
                statusCount: safeStatusCount,
                lastFetchedAt: now,
              };
              results.push(cached);

              // Update local SQLite asynchronously (fire and forget)
              NativeDB.updatePresenceData(row).catch(e => console.warn('[PresenceSyncWorker] SQLite error:', e));
            }
          }
        }

        // Batch update Zustand to instantly trigger UI re-renders for visible UserAvatars
        if (results.length > 0) {
          state.updateProfiles(results);
        }

      } catch (error) {
        console.error('[PresenceSyncWorker] Fatal sync error:', error);
      }

    }, 3000); // Process the queue every 3 seconds

    return () => clearInterval(syncInterval);
  }, []);
}
