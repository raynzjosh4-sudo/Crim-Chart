import { useState } from 'react';
import { supabase } from '@/core/supabase/client';
import { cloudMediaService } from '@/core/network/cloudMediaService';
import { MusicTrackItem } from '../components/music_posting/tiles/MusicListTile';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export function useMusicUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const currentUser = useAuthStore(state => state.user);

  const uploadMusicToBox = async (track: MusicTrackItem, boxId: string): Promise<MusicTrackItem | null> => {
    if (!currentUser) return null;
    
    setIsUploading(true);
    try {
      let uploadedAudioUrl = track.audioUrl;
      let uploadedCoverUrl = track.coverUrl;

      // 1. Upload audio to Cloudflare if it's a local file
      if (track.audioUrl && (track.audioUrl.startsWith('file://') || track.audioUrl.startsWith('/'))) {
        uploadedAudioUrl = await cloudMediaService.uploadMedia(track.audioUrl, 'posts_audio', currentUser.id);
      }

      // 2. Upload cover image to Cloudflare if one was chosen
      if (track.coverUrl && (track.coverUrl.startsWith('file://') || track.coverUrl.startsWith('/'))) {
        uploadedCoverUrl = await cloudMediaService.uploadMedia(track.coverUrl, 'posts_media_thumbs', currentUser.id);
      }

      // 3. Insert into posts table
      const metadata = {
        title: track.title,
        artist: track.artist,
        coverUrl: uploadedCoverUrl || '',
        duration: track.duration || '0:00',
      };

      const postPayload = {
        author_id: currentUser.id,
        caption: track.title, // Use title as caption
        privacy: 'public',
        allow_comments: true,
        audio_url: uploadedAudioUrl,
        is_audio: true,
        thumbnail_urls: uploadedCoverUrl ? [uploadedCoverUrl] : [],
        metadata,
      };

      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert(postPayload)
        .select('id, author_id, created_at')
        .single();

      if (postError) throw postError;

      // 4. Tag the post to the box
      const { error: tagError } = await supabase.rpc('tag_post_to_box', {
        p_box_id: boxId,
        p_post_id: newPost.id,
      });

      if (tagError) throw tagError;

      // 4.1 Send notification to box owner if it's not the current user's box
      const { data: boxData } = await supabase.from('boxes').select('owner_id, title').eq('id', boxId).single();
      if (boxData && boxData.owner_id !== currentUser.id) {
        await supabase.from('notifications').insert({
          recipient_id: boxData.owner_id,
          actor_id: currentUser.id,
          type: 'box_upload',
          reference_id: boxId,
          action_text: `added a track to your box ${boxData.title}`
        });
      }

      // 4.5 Record the reaction to update chart points
      await supabase.rpc('record_box_item_reaction', {
        p_post_id: newPost.id,
        p_box_id: boxId,
        p_reaction_type: 'tag'
      });

      // 5. Construct the final Track item to be injected into the UI
      const finalTrack: MusicTrackItem = {
        id: newPost.id,
        title: metadata.title,
        artist: metadata.artist,
        coverUrl: metadata.coverUrl,
        audioUrl: uploadedAudioUrl,
        duration: metadata.duration,
        owner: {
          id: currentUser.id,
          name: currentUser.displayName || currentUser.username || '',
          avatarUrl: currentUser.profileImageUrl || '',
        },
        likesCount: 0,
        commentsCount: 0,
        viewsCount: 0,
        downloadsCount: 0,
      };

      return finalTrack;
    } catch (e: any) {
      console.error("[useMusicUpload] Upload failed:", e);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, uploadMusicToBox };
}
