import { NativeDB } from '@/core/db/NativeDB';
import { cloudMediaService } from '@/core/network/cloudMediaService';
import { useProfileCacheStore } from '@/core/store/useProfileCacheStore';
import { supabase } from '@/core/supabase/client';
import { create } from 'zustand';

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
  channel_status: 'channel_status',
  channel_moment: 'channel_moment',
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
  channelAvatarUrl?: string;
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
  isShortClip?: boolean;
}

interface PostingState {
  isPosting: boolean;
  errorMessage: string | null;
  createPost: (params: CreatePostParams) => Promise<boolean>;
  clearError: () => void;
  pendingPosts: any[];
  removePendingPostsByChannel: (channelId: string) => void;
}

export const usePostingStore = create<PostingState>((set) => ({
  isPosting: false,
  errorMessage: null,
  pendingPosts: [],

  clearError: () => set({ errorMessage: null }),
  removePendingPostsByChannel: (channelId) => set((state) => ({ 
    pendingPosts: state.pendingPosts.filter(p => p.channel_id !== channelId) 
  })),

  createPost: async (params) => {
    set({ isPosting: true, errorMessage: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Optimistic Update: inject pending post for offline-first feel
      if (params.postType === PostType.channel) {
        const visualMedia = params.media.filter(
          (m) => m.type === MediaType.photo || m.type === MediaType.video
        );
        const isVideo = visualMedia.some((m) => m.type === MediaType.video);
        
        const pendingPost = {
          id: `pending-${Date.now()}`,
          channel_id: params.channelId ?? 'general',
          title: params.caption || '',
          thumbnailUrl: visualMedia.length > 0 ? (visualMedia[0].thumbnailUrl || visualMedia[0].path) : null,
          imageUrls: isVideo ? [] : visualMedia.map(m => m.path),
          videoUrl: isVideo ? visualMedia[0].path : null,
          audioUrl: params.media.find(m => m.type === MediaType.audio)?.path || null,
          isAudio: params.media.some(m => m.type === MediaType.audio),
          isVideo: isVideo,
          type: isVideo ? 'video' : (params.media.some(m => m.type === MediaType.audio) ? 'audio' : 'image'),
          sourceTable: 'channel_posts',
          aspectRatio: params.aspectRatio || null,
          metadata: {},
          likes: 0,
          commentsCount: 0,
          tagsCount: 0,
          createdAt: new Date().toISOString(),
          addedBy: {
            id: user.id,
            name: user.displayName || user.username || 'User',
            avatarUrl: user.profileImageUrl || null,
          },
          isPending: true,
        };
        set((state) => ({ pendingPosts: [pendingPost, ...state.pendingPosts] }));
      }

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

      // Ensure all videos have a local thumbnail generated if not provided, or if it is an mp4
      for (const m of visualMedia) {
        if (m.type === MediaType.video && (!m.thumbnailUrl || m.thumbnailUrl.endsWith('.mp4'))) {
          try {
            const VideoThumbnails = require('expo-video-thumbnails');
            const { uri } = await VideoThumbnails.getThumbnailAsync(m.path, { time: 1000 });
            m.thumbnailUrl = uri;
          } catch (e) {
            console.warn('[usePostingStore] Fallback thumbnail generation failed:', e);
          }
        }
      }

      for (const m of visualMedia) {
        let uploadedMainUrl = m.path;

        if (m.type === MediaType.video && (m.path.startsWith('file://') || m.path.startsWith('/') || m.path.startsWith('blob:'))) {
          console.log('[usePostingStore] 1️⃣ Uploading raw video to Cloudflare R2 for Coconut...');
          const videoFilename = `${user.id}_${Date.now()}.mp4`;
          
          await cloudMediaService.uploadRawVideoForTranscoding(m.path, videoFilename);

          console.log('[usePostingStore] 2️⃣ Triggering Coconut Video Processor Edge Function...');
          const { data: functionData, error: functionError } = await supabase.functions.invoke('process-video', {
            body: { 
              videoFilename: videoFilename,
              userId: user.id 
            }
          });

          // Add this line to catch the real error we are forcing through:
          if (functionData?.error) throw new Error(functionData.error); 
          
          if (functionError) throw new Error("Network failed");

          console.log('[usePostingStore] ✅ Processing Started! Future Stream URL:', functionData.streamUrl);
          
          uploadedMainUrl = functionData.streamUrl;
          galleryUrls.push(uploadedMainUrl);
          galleryThumbs.push(functionData.thumbnailUrl);

        } else if (m.path.startsWith('file://') || m.path.startsWith('/') || m.path.startsWith('blob:')) {
          // blob: URLs come from the web image picker — upload to R2
          console.log('[usePostingStore] ☁️ Uploading image to Cloudflare R2...', m.path.substring(0, 60));
          uploadedMainUrl = await cloudMediaService.uploadMedia(m.path, 'posts_media', user.id);
          console.log('[usePostingStore] ✅ Uploaded:', uploadedMainUrl);
          galleryUrls.push(uploadedMainUrl);
        } else {
          galleryUrls.push(m.path);
        }

        // Process the local thumbnail if it exists
        if (m.thumbnailUrl) {
          if (m.thumbnailUrl === m.path) {
            if (m.type !== MediaType.video) {
              galleryThumbs.push(uploadedMainUrl);
            }
          } else if (m.thumbnailUrl.startsWith('file://') || m.thumbnailUrl.startsWith('/') || m.thumbnailUrl.startsWith('blob:')) {
            const thumbUrl = await cloudMediaService.uploadMedia(m.thumbnailUrl, 'posts_media_thumbs', user.id);
            if (m.type === MediaType.video) {
              if (galleryThumbs.length > 0) {
                galleryThumbs[galleryThumbs.length - 1] = thumbUrl;
              } else {
                galleryThumbs.push(thumbUrl);
              }
            } else {
              galleryThumbs.push(thumbUrl);
            }
          } else {
            if (m.type === MediaType.video) {
              if (galleryThumbs.length > 0) {
                galleryThumbs[galleryThumbs.length - 1] = m.thumbnailUrl;
              } else {
                galleryThumbs.push(m.thumbnailUrl);
              }
            } else {
              galleryThumbs.push(m.thumbnailUrl);
            }
          }
        }
      }

      const metadata: Record<string, any> = {};
      if (params.isShortClip !== undefined) {
        metadata.is_short = params.isShortClip;
      }

      if (audioMedia) {
        if (audioMedia.path.startsWith('file://') || audioMedia.path.startsWith('/') || audioMedia.path.startsWith('blob:')) {
          console.log('[usePostingStore] ☁️ Uploading audio to Cloudflare R2...');
          const url = await cloudMediaService.uploadMedia(audioMedia.path, 'posts_audio', user.id);
          console.log('[usePostingStore] ✅ Audio uploaded:', url);
          finalAudioUrl = url;
        } else {
          finalAudioUrl = audioMedia.path;
        }

        // Upload the audio cover image (thumbnail)
        if (audioMedia.thumbnailUrl) {
          if (audioMedia.thumbnailUrl.startsWith('file://') || audioMedia.thumbnailUrl.startsWith('/') || audioMedia.thumbnailUrl.startsWith('blob:')) {
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

      const finalImageUrls = isVideo ? [] : galleryUrls;
      const finalVideoUrl = isVideo ? galleryUrls[0] : null;

      // 1. If it's a MOMENT
      if (params.postType === PostType.moment) {
        if (!params.channelId) throw new Error('Channel ID is required for moments');
        const mediaUrl = galleryUrls.length > 0 ? galleryUrls[0] : (finalAudioUrl || '');
        const momentPayload = {
          channel_id: params.channelId,
          author_id: user.id,
          media_url: mediaUrl,
          caption: params.caption,
          media_type: isVideo ? 'video' : (audioMedia ? 'audio' : 'photo'),
          thumbnail_url: galleryThumbs.length > 0 ? galleryThumbs[0] : null,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        const { error, data } = await supabase.from('channel_moments').insert(momentPayload).select().single();
        if (error) throw error;
        if (data) {
          import('@/channel/data/sources/ChannelLocalSource').then(({ channelLocalSource }) => {
            channelLocalSource.saveMoments([data]);
          });
        }
      }
      // 2. If it's a STATUS
      else if (params.postType === PostType.status) {
        if (params.channelId) {
          const channelStatusPayload = {
            channel_id: params.channelId,
            author_id: user.id,
            caption: params.caption || null,
            image_urls: finalImageUrls,
            video_url: finalVideoUrl,
            audio_url: finalAudioUrl,
            is_video: isVideo,
            is_audio: !!finalAudioUrl,
            thumbnail_url: galleryThumbs.length > 0 ? galleryThumbs[0] : null,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          };
          const { error } = await supabase.from('channel_statuses').insert(channelStatusPayload);
          if (error) throw error;
          
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('channel_status_posted'));
          }
        } else {
          const statusPayload = {
            author_id: user.id,
            caption: params.caption || null,
            image_urls: finalImageUrls,
            video_url: finalVideoUrl,
            audio_url: finalAudioUrl,
            is_video: isVideo,
            is_audio: !!finalAudioUrl,
            privacy: params.isPublicFeed ? 'public' : 'private',
            allow_comments: params.allowComments ?? true,
            thumbnail_url: galleryThumbs.length > 0 ? galleryThumbs[0] : null,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            metadata: Object.keys(metadata).length > 0 ? metadata : null,
          };
          const { error } = await supabase.from('statuses').insert(statusPayload);
          if (error) throw error;
          markHasStatusLocally();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('status_posted'));
          }
        }
      }
      // 3. If it's a CHANNEL POST
      else if (params.postType === PostType.channel) {
        const cPostPayload = {
          author_id: user.id,
          channel_id: params.channelId ?? 'general',
          channel_name: params.channelName || null,
          channel_avatar_url: params.channelAvatarUrl || null,
          author_username: user.displayName || user.username || 'User',
          author_profile_image_url: user.profileImageUrl || null,
          caption: params.caption,
          is_public: params.isPublicFeed ?? true,
          allow_comments: params.allowComments ?? true,
          post_type: params.postType,
          widget_type: 'channel_post',
          type: isVideo ? 'video' : (finalAudioUrl ? 'audio' : 'image'),
          aspect_ratio: params.aspectRatio,
          is_video: isVideo,
          video_url: finalVideoUrl,
          video_urls: finalVideoUrl ? [finalVideoUrl] : [],
          image_urls: finalImageUrls,
          thumbnail_urls: galleryThumbs,
          audio_url: finalAudioUrl,
          is_audio: !!finalAudioUrl,
          metadata,
        };
        const { error } = await supabase.from('channel_posts').insert(cPostPayload);
        if (error) throw error;

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('channel_post_created'));
        }
      }
      // 3.5. If it's a CHANNEL STATUS
      else if (params.postType === PostType.channel_status) {
        if (!params.channelId) throw new Error('Channel ID is required for channel statuses');
        const cStatusPayload = {
          channel_id: params.channelId,
          author_id: user.id,
          caption: params.caption || null,
          image_urls: finalImageUrls,
          video_url: finalVideoUrl,
          audio_url: finalAudioUrl,
          is_video: isVideo,
          is_audio: !!finalAudioUrl,
          thumbnail_url: galleryThumbs.length > 0 ? galleryThumbs[0] : null,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        const { error } = await supabase.from('channel_statuses').insert(cStatusPayload);
        if (error) throw error;
      }
      // 3.6. If it's a CHANNEL MOMENT
      else if (params.postType === PostType.channel_moment) {
        if (!params.channelId) throw new Error('Channel ID is required for channel moments');
        const firstMedia = finalImageUrls[0] || finalVideoUrl || '';
        const cMomentPayload = {
          channel_id: params.channelId,
          author_id: user.id,
          caption: params.caption || null,
          media_url: firstMedia,
          media_type: isVideo ? 'video' : (audioMedia ? 'audio' : 'photo'),
          thumbnail_url: galleryThumbs.length > 0 ? galleryThumbs[0] : (finalImageUrls[0] || null),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        const { error, data } = await supabase.from('channel_moments').insert(cMomentPayload).select().single();
        if (error) throw error;
        if (data) {
          import('@/channel/data/sources/ChannelLocalSource').then(({ channelLocalSource }) => {
            channelLocalSource.saveMoments([data]);
          });
        }
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
          video_url: finalVideoUrl,
          video_urls: finalVideoUrl ? [finalVideoUrl] : [],
          image_urls: finalImageUrls,
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
