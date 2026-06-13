import { supabase } from '@/core/supabase/client';
import { cloudMediaService } from '@/core/network/cloudMediaService';
import { create } from 'zustand';
import { useProfileCacheStore } from '@/core/store/useProfileCacheStore';
import { NativeDB } from '@/core/db/NativeDB';
import * as VideoThumbnails from 'expo-video-thumbnails';

export enum MediaType {
  photo = 'photo',
  video = 'video',
  audio = 'audio',
}

export enum MediaSource {
  device = 'device',
  gallery = 'gallery',
}

export const PostType = {
  channel: 'channel_post',
  status: 'status',
  comment: 'comment',
  manifesto: 'manifesto',
  moment: 'moment',
  repost: 'repost',
} as const;

export interface MediaItem {
  path: string;
  type: MediaType;
  source: MediaSource;
  thumbnailUrl?: string;
  linkedPostId?: string;
  aspectRatio?: number;
  title?: string;
  artist?: string;
  lyrics?: string;
}

export interface CreatePostParams {
  media: MediaItem[];
  caption: string;
  channelId?: string;
  channelName?: string;
  isMyChannel?: boolean;
  postType: string;
  shareToStatus?: boolean;
  allowComments?: boolean;
  isPublicFeed?: boolean;
  shareToMoment?: boolean;
  linkedPostId?: string;
  linkedAuthorUsername?: string;
  linkedCaption?: string;
  linkedChannelId?: string;
  linkedThumbnailUrls?: string[];
  aspectRatio?: number;
}

interface PostingState {
  isPosting: boolean;
  errorMessage: string | null;
  createPost: (params: CreatePostParams) => Promise<boolean>;
  clearError: () => void;
}

export const usePostingStore = create<PostingState>((set) => ({
  isPosting: false,
  errorMessage: null,

  clearError: () => set({ errorMessage: null }),

  createPost: async (params) => {
    set({ isPosting: true, errorMessage: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const markHasStatusLocally = () => {
        const currentProfile = useProfileCacheStore.getState().profiles[user.id];
        const newCount = (currentProfile?.statusCount || 0) + 1;
        useProfileCacheStore.getState().updateProfile(user.id, { hasStatus: true, statusCount: newCount });
        NativeDB.updatePresenceData({
          id: user.id,
          is_online: currentProfile?.isOnline ?? true,
          last_seen: currentProfile?.lastSeen ?? new Date().toISOString(),
          has_status: true,
          status_count: newCount,
        }).catch(console.warn);
      };

      const visualMedia = params.media.filter(
        (m) => m.type === MediaType.photo || m.type === MediaType.video
      );
      const audioMedia = params.media.find((m) => m.type === MediaType.audio);
      const isVideo = visualMedia.some((m) => m.type === MediaType.video);

      const galleryUrls: string[] = [];
      const galleryThumbs: string[] = [];
      let finalAudioUrl: string | null = null;

      for (const m of visualMedia) {
        let uploadedMainUrl = m.path;
        if (m.path.startsWith('file://') || m.path.startsWith('/')) {
           uploadedMainUrl = await cloudMediaService.uploadMedia(m.path, 'posts_media', user.id);
           galleryUrls.push(uploadedMainUrl);
        } else {
           galleryUrls.push(m.path);
        }
        
        if (m.type === MediaType.video && (m.path.startsWith('file://') || m.path.startsWith('/'))) {
           // It's a video, let's generate a REAL image thumbnail locally!
           try {
             const { uri } = await VideoThumbnails.getThumbnailAsync(m.path, { time: 1000 });
             const thumbUrl = await cloudMediaService.uploadMedia(uri, 'posts_media_thumbs', user.id);
             galleryThumbs.push(thumbUrl);
           } catch (err) {
             console.warn('Failed to generate real video thumbnail, falling back to video url', err);
             galleryThumbs.push(uploadedMainUrl);
           }
        } else if (m.thumbnailUrl) {
           if (m.thumbnailUrl === m.path) {
             galleryThumbs.push(uploadedMainUrl);
           } else if (m.thumbnailUrl.startsWith('file://') || m.thumbnailUrl.startsWith('/')) {
             const thumbUrl = await cloudMediaService.uploadMedia(m.thumbnailUrl, 'posts_media_thumbs', user.id);
             galleryThumbs.push(thumbUrl);
           } else {
             galleryThumbs.push(m.thumbnailUrl);
           }
        }
      }

      const metadata: Record<string, any> = {};

      if (audioMedia) {
        if (audioMedia.path.startsWith('file://') || audioMedia.path.startsWith('/')) {
           const url = await cloudMediaService.uploadMedia(audioMedia.path, 'posts_audio', user.id);
           finalAudioUrl = url;
        } else {
           finalAudioUrl = audioMedia.path;
        }

        // Upload the audio cover image (thumbnail)
        if (audioMedia.thumbnailUrl) {
           if (audioMedia.thumbnailUrl.startsWith('file://') || audioMedia.thumbnailUrl.startsWith('/')) {
             const thumbUrl = await cloudMediaService.uploadMedia(audioMedia.thumbnailUrl, 'posts_media_thumbs', user.id);
             galleryThumbs.push(thumbUrl);
           } else {
             galleryThumbs.push(audioMedia.thumbnailUrl);
           }
        }

        // Build metadata JSON
        if (audioMedia.title) metadata.title = audioMedia.title;
        if (audioMedia.artist) metadata.artist = audioMedia.artist;
        if (audioMedia.lyrics) metadata.lyrics = audioMedia.lyrics;
      }

      let mainInsertSuccess = true;

      // 1. If it's a MOMENT
      if (params.postType === PostType.moment) {
        if (!params.channelId) throw new Error('Channel ID is required for moments');
        const mediaUrl = galleryUrls.length > 0 ? galleryUrls[0] : (finalAudioUrl || '');
        const momentPayload = {
          channel_id: params.channelId,
          author_id: user.id,
          media_url: mediaUrl,
          caption: params.caption,
          media_type: isVideo ? 'video' : 'photo', // Or 'audio'
          thumbnail_url: galleryThumbs.length > 0 ? galleryThumbs[0] : null,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        const { error } = await supabase.from('channel_moments').insert(momentPayload);
        if (error) throw error;
      }
      // 2. If it's a STATUS
      else if (params.postType === PostType.status) {
        const statusPayload = {
          author_id: user.id,
          caption: params.caption || null,
          image_urls: galleryUrls || [],
          video_url: isVideo ? visualMedia.find((m) => m.type === MediaType.video)?.path || null : null,
          audio_url: finalAudioUrl,
          is_video: isVideo,
          is_audio: !!finalAudioUrl,
          privacy: params.isPublicFeed ? 'public' : 'private',
          allow_comments: params.allowComments ?? true,
          thumbnail_url: galleryThumbs.length > 0 ? galleryThumbs[0] : null,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        const { error } = await supabase.from('statuses').insert(statusPayload);
        if (error) throw error;
        markHasStatusLocally();
      }
      // 3. If it's a CHANNEL POST
      else if (params.postType === PostType.channel) {
        const cPostPayload = {
          author_id: user.id,
          channel_id: params.channelId ?? 'general',
          channel_name: params.channelName,
          caption: params.caption,
          is_public: params.isPublicFeed ?? true,
          allow_comments: params.allowComments ?? true,
          post_type: params.postType,
          aspect_ratio: params.aspectRatio,
          is_video: isVideo,
          image_urls: galleryUrls,
          thumbnail_urls: galleryThumbs,
          audio_url: finalAudioUrl,
          is_audio: !!finalAudioUrl,
          metadata,
        };
        const { error } = await supabase.from('channel_posts').insert(cPostPayload);
        if (error) throw error;
      }
      // 4. Default REGULAR POST
      else {
        const postPayload = {
          author_id: user.id,
          caption: params.caption,
          privacy: params.isPublicFeed ? 'public' : 'private',
          allow_comments: params.allowComments ?? true,
          aspect_ratio: params.aspectRatio,
          is_video: isVideo,
          image_urls: galleryUrls,
          thumbnail_urls: galleryThumbs,
          audio_url: finalAudioUrl,
          is_audio: !!finalAudioUrl,
          metadata,
        };
        const { error } = await supabase.from('posts').insert(postPayload);
        if (error) throw error;
      }

      // Status posting is now explicitly handled by the UI calling createPost with PostType.status
      set({ isPosting: false });
      return true;
    } catch (e: any) {
      console.error('[usePostingStore] createPost caught error:', e);
      set({ isPosting: false, errorMessage: e.message });
      return false;
    }
  },
}));
