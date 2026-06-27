import { cloudMediaService } from '@/core/network/cloudMediaService';
import { supabase } from '@/core/supabase/client';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { MediaItem, MediaType } from './models/MediaItem';
import { CreatePostParams } from './PostingController';

export interface PostUploadResult {
  imageUrls: string[];
  hdVideoUrls: string[];
  sdVideoUrls: string[];
  audioUrl?: string;
  thumbnailUrls: string[];
  isVideo: boolean;
  isAudio: boolean;
}

export class MediaBakingService {
  /**
   * Uploads media assets to Cloudflare R2.
   * Videos are first transcoded into HLS on-device, then all chunks go to R2.
   * Images and audio are uploaded directly to R2 via CloudMediaService.
   */
  static async uploadMediaAssets(
    userId: string,
    media: MediaItem[],
    onProgress?: (progress: number) => void
  ): Promise<PostUploadResult> {
    const imageUrls: string[] = [];
    const hdVideoUrls: string[] = [];
    const sdVideoUrls: string[] = [];
    const thumbnailUrls: string[] = [];
    let audioUrl: string | undefined;
    let isVideo = false;
    let isAudio = false;

    let completed = 0;
    const total = media.length;

    for (const item of media) {
      // If path is already a remote URL, just use it directly.
      if (item.path.startsWith('http')) {
        if (item.type === MediaType.photo) imageUrls.push(item.path);
        else if (item.type === MediaType.video) {
          hdVideoUrls.push(item.path);
          sdVideoUrls.push(item.path);
          isVideo = true;
        } else if (item.type === MediaType.audio) {
          audioUrl = item.path;
          isAudio = true;
        }
      } else {
        try {
          if (item.type === MediaType.video) {
            // ── Video: transcode via Coconut API Edge Function ──
            console.log('[MediaBakingService] 1️⃣ Uploading raw video to Cloudflare R2 for Coconut...');
            const videoFilename = `${userId}_${Date.now()}.mp4`;
            await cloudMediaService.uploadRawVideoForTranscoding(item.path, videoFilename);

            console.log('[MediaBakingService] 2️⃣ Triggering Coconut Video Processor Edge Function...');
            const { data, error } = await supabase.functions.invoke('process-video', {
              body: { 
                videoFilename: videoFilename,
                userId: userId 
              }
            });

            if (error) {
              console.error('[MediaBakingService] Coconut trigger failed:', error);
              throw new Error(`Coconut Transcoding failed: ${error.message || 'Unknown error'}`);
            }

            console.log('[MediaBakingService] ✅ Processing Started! Future Stream URL:', data.streamUrl);
            
            hdVideoUrls.push(data.streamUrl);
            sdVideoUrls.push(data.streamUrl);
            thumbnailUrls.push(data.thumbnailUrl);
            isVideo = true;
          } else if (item.type === MediaType.photo) {
            // ── Photo: upload directly to R2 ──────────────────────────────────
            const url = await cloudMediaService.uploadMedia(item.path, 'photos', userId);
            imageUrls.push(url);
          } else if (item.type === MediaType.audio) {
            // ── Audio: upload directly to R2 ──────────────────────────────────
            const url = await cloudMediaService.uploadMedia(item.path, 'audio', userId);
            audioUrl = url;
            isAudio = true;
          }
        } catch (e) {
          console.error('[MediaBakingService] Upload failed for', item.path, e);
        }
      }

      // ── Thumbnail: upload directly to R2 ──────────────────────────────────
      if (item.type !== MediaType.video && item.thumbnailUrl) {
        if (item.thumbnailUrl.startsWith('http')) {
          thumbnailUrls.push(item.thumbnailUrl);
        } else {
          try {
            const thumbUrl = await cloudMediaService.uploadMedia(item.thumbnailUrl, 'thumbnails', userId);
            thumbnailUrls.push(thumbUrl);
          } catch (e) {
            console.error('[MediaBakingService] Thumbnail upload failed', e);
          }
        }
      }

      completed++;
      if (onProgress) onProgress(completed / total);
    }

    return {
      imageUrls,
      hdVideoUrls,
      sdVideoUrls,
      audioUrl,
      thumbnailUrls,
      isVideo,
      isAudio,
    };
  }

  static shapeFinalPostData(params: CreatePostParams, uploadResults: PostUploadResult): any {
    const {
      userId, caption, channelId, channelName, postType = 'post',
      parentPostId, isPublicFeed = true, allowComments = true, aspectRatio = 1.0
    } = params;

    return {
      id: uuidv4(),
      author_id: userId,
      channel_id: channelId,
      channel_name: channelName,
      caption,
      video_url: uploadResults.hdVideoUrls[0] || null,
      video_urls: uploadResults.hdVideoUrls,
      sd_video_url: uploadResults.sdVideoUrls[0] || null,
      audio_url: uploadResults.audioUrl || null,
      image_urls: uploadResults.imageUrls,
      thumbnail_urls: uploadResults.thumbnailUrls,
      is_video: uploadResults.isVideo,
      is_audio: uploadResults.isAudio,
      post_type: postType,
      parent_post_id: parentPostId,
      is_public: isPublicFeed,
      allow_comments: allowComments,
      aspect_ratio: aspectRatio,
      created_at: new Date().toISOString(),
    };
  }
}
