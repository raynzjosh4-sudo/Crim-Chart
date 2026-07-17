import { useState } from 'react';
import { supabase } from '@/core/supabase/client';
import { cloudMediaService } from '@/core/network/cloudMediaService';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export function useVideoUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const currentUser = useAuthStore(state => state.user);

  const uploadVideoToBox = async (videoItem: any, boxId: string): Promise<any | null> => {
    console.log(`[useVideoUpload] Started upload process for boxId: ${boxId}`);
    if (!currentUser) {
      console.log(`[useVideoUpload] ❌ No current user found. Aborting.`);
      return null;
    }
    
    setIsUploading(true);
    try {
      let uploadedVideoUrl = videoItem.videoUrl;
      let uploadedThumbnailUrl = videoItem.thumbnailUrl;
      let rawMp4Url = '';
      // 1. Upload video to Cloudflare if it's a local file
      if (videoItem.videoUrl && (videoItem.videoUrl.startsWith('file://') || videoItem.videoUrl.startsWith('/') || videoItem.videoUrl.startsWith('blob:'))) {
        console.log(`[useVideoUpload] 1️⃣ Uploading raw video to Cloudflare R2 for Transcoding...`);
        const videoFilename = `${currentUser.id}_${Date.now()}.mp4`;
        
        await cloudMediaService.uploadRawVideoForTranscoding(videoItem.videoUrl, videoFilename);

        console.log(`[useVideoUpload] 2️⃣ Triggering Video Processor Edge Function...`);
        const { data: functionData, error: functionError } = await supabase.functions.invoke('process-video', {
          body: { 
            videoFilename: videoFilename,
            userId: currentUser.id 
          }
        });

        if (functionData?.error) throw new Error(functionData.error); 
        if (functionError) throw new Error("Network failed");

        console.log(`[useVideoUpload] ✅ Processing Started! Future Stream URL:`, functionData.streamUrl);
        
        uploadedVideoUrl = functionData.streamUrl;
        rawMp4Url = functionData.rawVideoUrl; // The edge function returns the raw mp4 URL here
      }

      // 2. Upload thumbnail to Cloudflare if local
      if (videoItem.thumbnailUrl && (videoItem.thumbnailUrl.startsWith('file://') || videoItem.thumbnailUrl.startsWith('/') || videoItem.thumbnailUrl.startsWith('blob:'))) {
        console.log(`[useVideoUpload] 📤 Uploading local thumbnail to CloudMediaService...`);
        uploadedThumbnailUrl = await cloudMediaService.uploadMedia(videoItem.thumbnailUrl, 'posts_media_thumbs', currentUser.id);
        console.log(`[useVideoUpload] ✅ Thumbnail uploaded successfully. URL:`, uploadedThumbnailUrl);
      }

      // 3. Insert into posts table
      const metadata = {
        title: videoItem.title || 'Local Video',
        description: videoItem.description || '',
        duration: videoItem.duration || '0:00',
        director: currentUser.displayName || currentUser.username || '',
      };

      const postPayload = {
        author_id: currentUser.id,
        caption: videoItem.title || 'Local Video',
        privacy: 'public',
        allow_comments: true,
        video_url: uploadedVideoUrl,
        video_urls: uploadedVideoUrl ? (rawMp4Url ? [uploadedVideoUrl, rawMp4Url] : [uploadedVideoUrl]) : [],
        is_video: true,
        type: videoItem.isShort ? 'short' : 'long',
        thumbnail_urls: uploadedThumbnailUrl ? [uploadedThumbnailUrl] : [],
        metadata,
      };

      console.log(`[useVideoUpload] 📝 Inserting new post into Supabase...`);
      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert(postPayload)
        .select('id, author_id, created_at')
        .single();

      if (postError) {
        console.log(`[useVideoUpload] ❌ Error inserting post:`, postError);
        throw postError;
      }
      console.log(`[useVideoUpload] ✅ Post inserted successfully. Post ID:`, newPost.id);

      // 4. Tag the post to the box
      console.log(`[useVideoUpload] 🏷️ Tagging post ${newPost.id} to box ${boxId}...`);
      const { error: tagError } = await supabase.rpc('tag_post_to_box', {
        p_box_id: boxId,
        p_post_id: newPost.id,
      });

      if (tagError) {
        console.log(`[useVideoUpload] ❌ Error tagging post to box:`, tagError);
        throw tagError;
      }

      // 4.1 Send notification to box owner if it's not the current user's box
      const { data: boxData } = await supabase.from('boxes').select('owner_id, title').eq('id', boxId).single();
      if (boxData && boxData.owner_id !== currentUser.id) {
        await supabase.from('notifications').insert({
          recipient_id: boxData.owner_id,
          actor_id: currentUser.id,
          type: 'box_upload',
          reference_id: boxId,
          action_text: `added a video to your box ${boxData.title}`
        });
      }

      console.log(`[useVideoUpload] ✅ Post tagged successfully.`);

      // 4.5 Record the reaction to update chart points
      console.log(`[useVideoUpload] 📊 Recording 'tag' reaction for points...`);
      await supabase.rpc('record_box_item_reaction', {
        p_post_id: newPost.id,
        p_box_id: boxId,
        p_reaction_type: 'tag'
      });

      // 5. Construct the final Video item
      const finalVideo = {
        id: newPost.id,
        title: metadata.title,
        director: metadata.director,
        thumbnailUrl: uploadedThumbnailUrl || '',
        videoUrl: uploadedVideoUrl,
        isShort: videoItem.isShort || false,
        description: metadata.description,
        duration: metadata.duration,
        likes: 0,
        dislikes: 0,
        commentsCount: 0,
        viewsCount: 0,
        addedBy: {
          id: currentUser.id,
          name: currentUser.displayName || currentUser.username || '',
          avatarUrl: currentUser.profileImageUrl || '',
        }
      };

      return finalVideo;
    } catch (e: any) {
      console.error("[useVideoUpload] Upload failed:", e);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, uploadVideoToBox };
}
