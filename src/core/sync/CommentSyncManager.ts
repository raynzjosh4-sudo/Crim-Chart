import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { NativeDB } from '../db/NativeDB';
import { cloudMediaService } from '../network/cloudMediaService';
import { supabase } from '../supabase/supabaseConfig';

class CommentSyncManager {
  private isSyncing = false;

  async syncPendingComments(directComments?: any[]) {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const pendingComments = directComments || await NativeDB.getPendingComments();
      if (!pendingComments || pendingComments.length === 0) {
        this.isSyncing = false;
        return;
      }

      for (const comment of pendingComments) {
        try {
          let publicMediaUrl = comment.media_url;

          // If the media URL is a local file, upload it to Cloudflare R2
          if (publicMediaUrl && (publicMediaUrl.startsWith('file://') || publicMediaUrl.startsWith('blob:') || publicMediaUrl.startsWith('data:'))) {
            let isValid = false;
            
            const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';
            if (!isWeb && publicMediaUrl.startsWith('file://')) {
              const fileInfo = await FileSystem.getInfoAsync(publicMediaUrl);
              isValid = fileInfo.exists;
            } else {
              // On web, blob/data URIs are valid
              isValid = true;
            }

            if (isValid) {
              const extension = publicMediaUrl.split('.').pop() || 'tmp';
              // cloudMediaService.uploadMedia(localUri, folderName, userId)
              publicMediaUrl = await cloudMediaService.uploadMedia(
                publicMediaUrl,
                'comment_media',
                comment.author_id
              );
            }
          }

          // Format for Supabase (no is_pending field in remote DB)
          const remoteComment = {
            id: comment.id,
            post_id: comment.post_id,
            author_id: comment.author_id,
            author_username: comment.author_username,
            author_avatar_url: comment.author_avatar_url,
            text: comment.text,
            media_url: publicMediaUrl,
            media_type: comment.media_type,
            reply_to_id: comment.reply_to_id,
            created_at: comment.created_at,
            likes_count: comment.likes_count,
          };

          const { error } = await supabase.from('comments').upsert(remoteComment);

          // Fire broadcast to all connected clients instantly!
          const channel = supabase.channel(`comments:${comment.post_id}`);
          channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              channel.send({
                type: 'broadcast',
                event: 'new_comment',
                payload: { comment: remoteComment }
              });
            }
          });

          if (error) {
            if (typeof window !== 'undefined' && window.alert) window.alert('Supabase Sync Error: ' + error.message);
            console.error(`[CommentSyncManager] Error syncing comment ${comment.id}:`, JSON.stringify(error, null, 2));
          } else {
            // console.log(`[CommentSyncManager] Successfully synced comment ${comment.id}`);
            // Mark as synced locally
            await NativeDB.markCommentSynced(comment.id);
            // Optionally update the local db with the new remote media url if it changed
            if (publicMediaUrl !== comment.media_url) {
              const updatedComment = { ...comment, media_url: publicMediaUrl, is_pending: false };
              await NativeDB.upsertComments([updatedComment]);
            }
          }
        } catch (e) {
          console.error(`[CommentSyncManager] Failed to process comment ${comment.id}:`, e);
        }
      }
    } catch (error) {
      console.error('[CommentSyncManager] Global sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Subscribe to changes on a specific post
  subscribeToPostComments(postId: string, onNewComment: (comment: any) => void) {
    return supabase
      .channel(`comments:${postId}`)
      .on(
        'broadcast',
        { event: 'new_comment' },
        (payload) => {
          console.log('[CommentSyncManager] New comment received via Broadcast:', payload.payload.comment);
          // Insert it into local DB to cache it, but mark it as NOT pending
          const newComment = { ...payload.payload.comment, is_pending: false };
          NativeDB.upsertComments([newComment]);
          onNewComment(newComment);
        }
      )
      .subscribe((status) => {
        // console.log(`[CommentSyncManager] Broadcast subscription status for post ${postId}:`, status);
      });
  }
}

export const commentSyncManager = new CommentSyncManager();
