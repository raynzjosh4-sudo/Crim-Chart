import { supabase } from '@/core/supabase/supabaseConfig';
import { MediaItem, MediaType } from './models/MediaItem';
import { CreatePostParams } from './PostingController';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

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
   * Uploads media assets to Supabase storage.
   * In a real app, this would also compress media beforehand using expo-video or react-native-compressor.
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
      // If path is already a URL, just add it.
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
        // Upload to Supabase Storage
        const fileExt = item.path.split('.').pop();
        const fileName = `${userId}/${Date.now()}_${uuidv4()}.${fileExt}`;
        
        try {
          // React Native specific File to Blob/FormData conversion might be needed here 
          // depending on the exact fetch implementation used by Supabase JS.
          const response = await fetch(item.path);
          const blob = await response.blob();
          
          const { data, error } = await supabase.storage
            .from('media')
            .upload(fileName, blob);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(data.path);

          if (item.type === MediaType.photo) imageUrls.push(publicUrl);
          else if (item.type === MediaType.video) {
            hdVideoUrls.push(publicUrl);
            sdVideoUrls.push(publicUrl); // Mock SD video as the same for now
            isVideo = true;
          } else if (item.type === MediaType.audio) {
            audioUrl = publicUrl;
            isAudio = true;
          }

        } catch (e) {
          console.error('[MediaBakingService] Upload failed for', item.path, e);
          // throw e; // Decided to continue or throw based on app policy
        }
      }

      // Handle thumbnails (if they are local paths)
      if (item.thumbnailUrl) {
        if (item.thumbnailUrl.startsWith('http')) {
          thumbnailUrls.push(item.thumbnailUrl);
        } else {
           // Same upload logic for thumbnail
           try {
             const fileExt = item.thumbnailUrl.split('.').pop() || 'jpg';
             const fileName = `${userId}/thumb_${Date.now()}_${uuidv4()}.${fileExt}`;
             const response = await fetch(item.thumbnailUrl);
             const blob = await response.blob();
             const { data, error } = await supabase.storage.from('media').upload(fileName, blob);
             if (!error && data) {
               const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path);
               thumbnailUrls.push(publicUrl);
             }
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
