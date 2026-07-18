import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { dbService } from '@/core/db/database';
import { TABLES } from '@/core/db/schema';
import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useCallback } from 'react';
import { Platform } from 'react-native';

export function useReportPost() {
  const { startLoading, stopLoading } = useGlobalProgress();
  const currentUser = useAuthStore((state) => state.user);

  const reportPost = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!currentUser?.id || !postId) {
        return false;
      }

      try {
        startLoading();

        // 1. Insert into Supabase post_reports table
        const { error } = await supabase
          .from('post_reports')
          .insert({
            post_id: postId,
            reporter_id: currentUser.id,
          });

        if (error) {
          console.error('Supabase report error:', error);
          // If the error code implies a unique violation (already reported), we can ignore it
        }

        // 2. Clean up the reported post from local feeds so it disappears instantly
        try {
          const queries = [
            `DELETE FROM ${TABLES.FEED_STATUSES} WHERE id = ?`,
            `DELETE FROM ${TABLES.STATUSES} WHERE id = ?`,
            `DELETE FROM ${TABLES.CHANNEL_POSTS} WHERE id = ?`,
            `DELETE FROM ${TABLES.DISCOVERY_FEED} WHERE id = ?`,
            `DELETE FROM ${TABLES.PROFILE_MEDIA} WHERE id = ?`
          ];

          for (const query of queries) {
            await dbService.execute(query, [postId]);
          }

          // Trigger a refresh so the UI updates instantly
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.dispatchEvent(new Event('status_posted'));
          } else {
            const { DeviceEventEmitter } = require('react-native');
            DeviceEventEmitter.emit('status_posted');
          }
        } catch (cleanupErr) {
          console.warn('Failed to clean up reported post data:', cleanupErr);
        }

        ChartToast.showSuccess(null, { title: 'Report Submitted', message: 'The post has been reported and hidden from your feed.' });
        return true;
      } catch (err: any) {
        console.error('Failed to report post:', err);
        ChartToast.showError(null, { title: 'Error', message: 'Could not report post at this time.' });
        return false;
      } finally {
        stopLoading();
      }
    },
    [currentUser?.id, startLoading, stopLoading]
  );

  return { reportPost };
}
