import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { dbService } from '@/core/db/database';
import { TABLES } from '@/core/db/schema';
import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useCallback } from 'react';
import { Platform } from 'react-native';

export interface BlockedUser {
  id: string;
  blocked_id: string;
  blocked_username: string | null;
  blocked_avatar_url: string | null;
  created_at: string;
}

export function useBlockUser() {
  const { startLoading, stopLoading } = useGlobalProgress();
  const currentUser = useAuthStore((state) => state.user);

  const blockUser = useCallback(
    async (targetUserId: string, targetUsername?: string, targetAvatarUrl?: string): Promise<boolean> => {
      if (!currentUser?.id || !targetUserId) {
        return false;
      }

      if (currentUser.id === targetUserId) {
        ChartToast.showError(null, { title: 'Error', message: 'You cannot block yourself.' });
        return false;
      }

      try {
        startLoading();

        // 1. Insert into Supabase
        const { error } = await supabase
          .from('blocked_users')
          .insert({
            blocker_id: currentUser.id,
            blocked_id: targetUserId,
          });

        if (error) {
          // If the error code implies a unique violation (already blocked), we can ignore it
          if (error.code !== '23505') { 
            console.error('Supabase block error (falling back to local DB):', error);
          }
        }

        // 2. Insert into Local SQLite DB
        try {
          const sql = `
            INSERT OR REPLACE INTO ${TABLES.BLOCKED_USERS} (
              id, blocker_id, blocked_id, blocked_username, blocked_avatar_url, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
          `;
          const params = [
            `${currentUser.id}_${targetUserId}`,
            currentUser.id,
            targetUserId,
            targetUsername || null,
            targetAvatarUrl || null,
            new Date().toISOString()
          ];
          await dbService.execute(sql, params);
        } catch (localDbError) {
          console.warn('Failed to save block to local DB:', localDbError);
        }

        // 3. Clean up the blocked user's data from local feeds so they disappear instantly offline
        try {
          const queries = [
            `DELETE FROM ${TABLES.FEED_STATUSES} WHERE author_id = ?`,
            `DELETE FROM ${TABLES.STATUSES} WHERE author_id = ?`,
            `DELETE FROM ${TABLES.CHANNELS} WHERE creator_id = ?`,
            `DELETE FROM ${TABLES.CHANNEL_POSTS} WHERE author_id = ?`,
            `DELETE FROM ${TABLES.BOXES} WHERE owner_id = ?`,
            `DELETE FROM ${TABLES.BOX_ITEMS} WHERE added_by_id = ? OR author_id = ?`,
            `DELETE FROM ${TABLES.DISCOVERY_FEED} WHERE author_id = ?`,
            `DELETE FROM ${TABLES.PROFILE_MEDIA} WHERE author_id = ?`,
            `DELETE FROM ${TABLES.COMMENTS} WHERE author_id = ?`,
            `DELETE FROM ${TABLES.MUSIC_FEED} WHERE owner_id = ?`
          ];

          const likeParam = `%"author_id":"${targetUserId}"%`;
          
          for (const query of queries) {
            // box_items takes two params because of the OR clause
            if (query.includes('OR author_id = ?')) {
              await dbService.execute(query, [targetUserId, targetUserId]);
            } else {
              await dbService.execute(query, [targetUserId]);
            }
          }
          
          // main_feed uses prefetched JSON, so we use LIKE
          await dbService.execute(`DELETE FROM main_feed WHERE prefetched_data LIKE ?`, [likeParam]);
          
          // Trigger a refresh so the UI updates instantly
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.dispatchEvent(new Event('status_posted'));
          } else {
            const { DeviceEventEmitter } = require('react-native');
            DeviceEventEmitter.emit('status_posted');
          }
        } catch (cleanupErr) {
          console.warn('Failed to clean up blocked user data:', cleanupErr);
        }

        return true;
      } catch (err: any) {
        console.error('Failed to block user:', err);
        ChartToast.showError(null, { title: 'Error', message: 'Could not block user.' });
        return false;
      } finally {
        stopLoading();
      }
    },
    [currentUser?.id, startLoading, stopLoading]
  );

  const unblockUser = useCallback(
    async (targetUserId: string): Promise<boolean> => {
      if (!currentUser?.id || !targetUserId) return false;

      try {
        startLoading();

        // Remove from Supabase
        const { error } = await supabase
          .from('blocked_users')
          .delete()
          .match({ blocker_id: currentUser.id, blocked_id: targetUserId });

        if (error) {
          console.error('Supabase unblock error (falling back to local DB):', error);
        }

        // Remove from local DB
        try {
          await dbService.execute(`DELETE FROM ${TABLES.BLOCKED_USERS} WHERE blocker_id = ? AND blocked_id = ?`, [currentUser.id, targetUserId]);
        } catch (localDbError) {
          console.warn('Failed to remove block from local DB:', localDbError);
        }

        ChartToast.showSuccess(null, { title: 'Success', message: 'User unblocked successfully.' });
        return true;
      } catch (err: any) {
        console.error('Failed to unblock user:', err);
        ChartToast.showError(null, { title: 'Error', message: 'Could not unblock user.' });
        return false;
      } finally {
        stopLoading();
      }
    },
    [currentUser?.id, startLoading, stopLoading]
  );

  const fetchBlockedUsers = useCallback(
    async (): Promise<BlockedUser[]> => {
      if (!currentUser?.id) return [];

      let isOnline = true;

      // 1. Fetch from Supabase
      try {
        const { data, error } = await supabase
          .from('blocked_users')
          .select(`
            id,
            blocked_id,
            created_at,
            profiles:blocked_id (
              display_name,
              profile_image_url
            )
          `)
          .eq('blocker_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // 2. Sync to local DB
        if (data) {
          const mappedData: BlockedUser[] = data.map((row: any) => ({
            id: row.id,
            blocker_id: currentUser.id,
            blocked_id: row.blocked_id,
            blocked_username: row.profiles?.display_name || null,
            blocked_avatar_url: row.profiles?.profile_image_url || null,
            created_at: row.created_at,
          }));

          if (Platform.OS !== 'web') {
            try {
              await dbService.database.withTransactionAsync(async (tx) => {
                for (const row of mappedData) {
                  await tx.runAsync(`
                    INSERT OR REPLACE INTO ${TABLES.BLOCKED_USERS} (
                      id, blocker_id, blocked_id, blocked_username, blocked_avatar_url, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?)
                  `, row.id, currentUser.id, row.blocked_id, row.blocked_username, row.blocked_avatar_url, row.created_at);
                }
              });
            } catch (localErr) {
              console.warn('Failed to sync blocked users to local DB', localErr);
            }
          }
          
          return mappedData; // Return fresh network data immediately
        }
      } catch (err) {
        console.warn('Could not fetch blocked users from Supabase, falling back to local DB', err);
      }

      // 3. Fallback to local DB for offline experience
      try {
        if (Platform.OS === 'web') return []; // No SQLite on web
        const localData = await dbService.query<BlockedUser>(
          `SELECT id, blocked_id, blocked_username, blocked_avatar_url, created_at 
           FROM ${TABLES.BLOCKED_USERS} 
           WHERE blocker_id = ? 
           ORDER BY created_at DESC`,
          [currentUser.id]
        );
        return localData || [];
      } catch (localErr) {
        console.error('Failed to fetch from local DB:', localErr);
        return [];
      }
    },
    [currentUser?.id]
  );

  return { blockUser, unblockUser, fetchBlockedUsers };
}
