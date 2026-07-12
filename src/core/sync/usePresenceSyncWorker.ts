import { NativeDB } from '@/core/db/NativeDB';
import { CachedProfile, useProfileCacheStore } from '@/core/store/useProfileCacheStore';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useViewedStatusStore } from '@/core/store/useViewedStatusStore';
import { useEffect } from 'react';

export function usePresenceSyncWorker() {
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      const state = useProfileCacheStore.getState();
      const allIds = Array.from(state.requestedUserIds);

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const idsToSync = allIds.filter(id => uuidRegex.test(id));

      if (allIds.length === 0) return;

      // Clear the queue so we don't double fetch the same IDs
      state.clearRequestedSyncs(allIds);

      if (idsToSync.length === 0) return;

      try {
        // Chunk requests to avoid hitting URL query length limits
        const chunkSize = 50;
        const results: CachedProfile[] = [];

        for (let i = 0; i < idsToSync.length; i += chunkSize) {
          const chunk = idsToSync.slice(i, i + chunkSize);

          // Only fetch the bare minimum presence/status data
          const { data, error } = await supabase
            .from('profiles')
            .select(`
              id, is_online, last_seen, has_status, status_count,
              user_connection_stats (
                rel_sent_count, rel_accepted_count, relationship_status,
                preferred_countries, preferred_age_ranges, show_status_circle,
                show_status_text, show_country_pref, show_age_pref, locked_intent
              )
            `)
            .in('id', chunk);

          if (error) {
            const isNetworkError = error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch');
            if (!isNetworkError) {
              console.warn('[PresenceSyncWorker] Supabase error:', error);
            }
            // Re-queue failed IDs for the next cycle
            chunk.forEach(id => state.requestSync(id));
            continue;
          } else {
            // console.log('\n\n================ PRESENCE SYNC WORKER FETCHED ================');
            // console.log(JSON.stringify(data, null, 2));
            // console.log('==============================================================\n\n');
          }

          if (data) {
            const now = Date.now();
            
            // Collect active user IDs to fetch their status IDs
            const activeUserIds = data.filter(row => row.status_count && row.status_count > 0).map(row => row.id);
            const unreadCounts: Record<string, number> = {};

            if (activeUserIds.length > 0) {
              const { data: statusesData } = await supabase
                .from('statuses')
                .select('id, author_id')
                .in('author_id', activeUserIds);
                
              if (statusesData) {
                const viewedStatusIds = useViewedStatusStore.getState().viewedStatusIds;
                statusesData.forEach(status => {
                  if (!viewedStatusIds[status.id]) {
                    unreadCounts[status.author_id] = (unreadCounts[status.author_id] || 0) + 1;
                  }
                });
              }
            }

            for (const row of data) {
              const safeStatusCount = Math.max(row.status_count || 0, 0);
              const isStatusRead = safeStatusCount > 0 ? (unreadCounts[row.id] || 0) === 0 : false;
              
              const cached: CachedProfile = {
                id: row.id,
                isOnline: !!row.is_online,
                lastSeen: row.last_seen,
                hasStatus: safeStatusCount > 0,
                isStatusRead,
                statusCount: safeStatusCount,
                lastFetchedAt: now,
              };
              results.push(cached);

              // Update local SQLite asynchronously (fire and forget)
              NativeDB.updatePresenceData(row).catch(e => console.warn('[PresenceSyncWorker] SQLite error:', e));

              if (row.user_connection_stats) {
                // user_connection_stats is returned as an array or an object depending on the relation (usually object for 1:1)
                const stats = Array.isArray(row.user_connection_stats) ? row.user_connection_stats[0] : row.user_connection_stats;
                if (stats) {
                  NativeDB.upsertUserConnectionStats({ user_id: row.id, ...stats }).catch(e => console.warn('[PresenceSyncWorker] stats SQLite error:', e));
                }
              }
            }
          }
        }

        // Batch update Zustand to instantly trigger UI re-renders for visible UserAvatars
        if (results.length > 0) {
          state.updateProfiles(results);
        }

      } catch (error: any) {
        const isNetworkError = error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch');
        if (!isNetworkError) {
          console.warn('[PresenceSyncWorker] Fatal sync error:', error);
        }
      }

    }, 3000); // Process the queue every 3 seconds

    return () => clearInterval(syncInterval);
  }, []);
}
