import { NativeDB } from '@/core/db/NativeDB';
import { cloudMediaService } from '@/core/network/cloudMediaService';
import { notificationService } from '@/core/notifications/NotificationService';
import { useProfileCacheStore } from '@/core/store/useProfileCacheStore';
import { supabase } from '@/core/supabase/client';
import NetInfo from '@react-native-community/netinfo';
import { DeviceEventEmitter, Platform } from 'react-native';
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
  category?: string;
}

interface PostingState {
  isPosting: boolean;
  errorMessage: string | null;
  createPost: (params: CreatePostParams) => Promise<boolean>;
  clearError: () => void;
  pendingPosts: any[];
  removePendingPostsByChannel: (channelId: string) => void;
  stagingMedia: any[];
  setStagingMedia: (media: any[]) => void;
}

export const usePostingStore = create<PostingState>((set) => ({
  isPosting: false,
  errorMessage: null,
  pendingPosts: [],
  stagingMedia: [],

  setStagingMedia: (media) => set({ stagingMedia: media }),
  clearError: () => set({ errorMessage: null }),
  removePendingPostsByChannel: (channelId) => set((state) => ({ 
    pendingPosts: state.pendingPosts.filter(p => p.channel_id !== channelId) 
  })),

  createPost: async (params) => {
    set({ isPosting: true, errorMessage: null });
    // Generate a unique task ID for tracking this upload's notification
    const taskId = `post-${Date.now()}`;
    let pendingPostId: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Initialize notifee channel + fire the opening notification
      if (Platform.OS !== 'web') {
        await notificationService.init();
        await notificationService.showUploadProgress(taskId, 0);
      }

      // Optimistic Update: inject pending post for offline-first feel
      if (params.postType === PostType.channel || params.isPublicFeed || params.postType === 'post') {
        const visualMedia = params.media.filter(
          (m) => m.type === MediaType.photo || m.type === MediaType.video
        );
        const isVideo = visualMedia.some((m) => m.type === MediaType.video);
        pendingPostId = `pending-${Date.now()}`;
        const pendingPost = {
          id: pendingPostId,
          channel_id: params.channelId ?? 'general',
          title: params.caption || '',
          thumbnailUrl: visualMedia.length > 0 ? (visualMedia[0].thumbnailUrl || visualMedia[0].path) : null,
          imageUrls: isVideo ? [] : visualMedia.map(m => m.path),
          videoUrl: isVideo ? visualMedia[0].path : null,
          audioUrl: params.media.find(m => m.type === MediaType.audio)?.path || null,
          isAudio: params.media.some(m => m.type === MediaType.audio),
          isVideo: isVideo,
          type: isVideo ? 'video' : (params.media.some(m => m.type === MediaType.audio) ? 'audio' : 'image'),
          sourceTable: params.postType === PostType.channel ? 'channel_posts' : 'posts',
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
        
        // Save to local SQLite feed for instant offline display
        if (params.postType !== PostType.channel) {
          NativeDB.upsertDiscoveryFeed([
            {
              id: pendingPost.id,
              author_id: pendingPost.addedBy.id,
              author_username: pendingPost.addedBy.name,
              author_avatar_url: pendingPost.addedBy.avatarUrl,
              channel_id: pendingPost.channel_id,
              caption: pendingPost.title,
              video_url: pendingPost.videoUrl,
              image_urls: JSON.stringify(pendingPost.imageUrls),
              is_video: pendingPost.isVideo ? 1 : 0,
              likes: 0,
              comments: 0,
              created_at: pendingPost.createdAt,
              widget_type: pendingPost.type,
              views_count: 0
            }
          ]).catch(e => console.warn('[Optimistic] DB Error:', e));
        }
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

      // ── STEP 1: Always generate thumbnails for video items before uploading (10%)
      for (const m of visualMedia) {
        if (m.type === MediaType.video) {
          const hasGoodThumb = m.thumbnailUrl &&
            !m.thumbnailUrl.endsWith('.mp4') &&
            !m.thumbnailUrl.endsWith('.mov');
          if (!hasGoodThumb) {
            try {
              const VideoThumbnails = require('expo-video-thumbnails');
              const { uri } = await VideoThumbnails.getThumbnailAsync(m.path, { time: 1000 });
              m.thumbnailUrl = uri;
            } catch (e) {
              console.warn('[usePostingStore] Thumbnail generation failed:', e);
            }
          }
        }
      }
      if (Platform.OS !== 'web') await notificationService.showUploadProgress(taskId, 10);

      // ── STEP 2: Check network before starting upload. Pause if offline.
      const checkAndWaitForNetwork = async () => {
        const state = await NetInfo.fetch();
        if (!state.isConnected || state.isInternetReachable === false) {
          if (Platform.OS !== 'web') await notificationService.showPostPaused(taskId);
          await notificationService.waitForNetwork();
          if (Platform.OS !== 'web') await notificationService.showPostResuming(taskId);
          // small delay so the "resuming" notification is visible
          await new Promise(res => setTimeout(res, 1200));
        }
      };
      await checkAndWaitForNetwork();

      for (const m of visualMedia) {
        const rawPath = m.path || (m as any).uri || '';
        let uploadedMainUrl = rawPath;

        const isLocalString = (p: any) => typeof p === 'string' && (p.startsWith('file://') || p.startsWith('/') || p.startsWith('blob:') || p.startsWith('ph://') || p.startsWith('content://'));
        const isBlob = (p: any) => typeof Blob !== 'undefined' && p instanceof Blob;

        if (m.type === MediaType.video && (isLocalString(rawPath) || isBlob(rawPath))) {
          if (isBlob(rawPath)) {
            // Pre-read Blob from web modal — upload directly to R2 as a regular image/video
            console.log('[usePostingStore] ☁️ Uploading video blob...');
            await checkAndWaitForNetwork();
            uploadedMainUrl = await cloudMediaService.uploadMedia(rawPath as any, 'posts_media', user.id);
            console.log('[usePostingStore] ✅ Video blob uploaded.');
            galleryUrls.push(uploadedMainUrl);
            await notificationService.showUploadProgress(taskId, 75);
          } else {
            console.log('[usePostingStore] 1️⃣ Uploading raw video...');
            const videoFilename = `${user.id}_${Date.now()}.mp4`;
            
            // Re-check network before this heavy upload step
            await checkAndWaitForNetwork();
            await notificationService.showUploadProgress(taskId, 30);
            await cloudMediaService.uploadRawVideoForTranscoding(rawPath as string, videoFilename);

            console.log('[usePostingStore] 2️⃣ Processing video...');
            await notificationService.showUploadProgress(taskId, 60);
            const { data: functionData, error: functionError } = await supabase.functions.invoke('process-video', {
              body: { 
                videoFilename: videoFilename,
                userId: user.id 
              }
            });

            if (functionData?.error) throw new Error(functionData.error); 
            if (functionError) throw new Error('Posting failed');
            // Guard: never store a raw .mp4 URL in the database
            if (!functionData.streamUrl || functionData.streamUrl.endsWith('.mp4')) {
              throw new Error('Posting failed: video not ready yet');
            }
            console.log('[usePostingStore] ✅ Video ready!');
            
            uploadedMainUrl = functionData.streamUrl;
            galleryUrls.push(uploadedMainUrl);
            galleryThumbs.push(functionData.thumbnailUrl);
            await notificationService.showUploadProgress(taskId, 75);
          }

        } else if (isLocalString(rawPath) || isBlob(rawPath)) {
          // blob: URLs (string) or pre-read Blob objects from the web modal picker
          console.log('[usePostingStore] ☁️ Uploading image...');
          await checkAndWaitForNetwork();
          uploadedMainUrl = await cloudMediaService.uploadMedia(rawPath as any, 'posts_media', user.id);
          console.log('[usePostingStore] ✅ Image uploaded.');
          galleryUrls.push(uploadedMainUrl);
          await notificationService.showUploadProgress(taskId, 75);
        } else {
          galleryUrls.push(rawPath as string);
        }

        // Process the local thumbnail if it exists
        if (m.thumbnailUrl) {
          const thumbIsLocalString = typeof m.thumbnailUrl === 'string' && (m.thumbnailUrl.startsWith('file://') || m.thumbnailUrl.startsWith('/') || m.thumbnailUrl.startsWith('blob:') || m.thumbnailUrl.startsWith('ph://') || m.thumbnailUrl.startsWith('content://'));
          const thumbIsBlob = typeof Blob !== 'undefined' && (m.thumbnailUrl as any) instanceof Blob;
          if (m.thumbnailUrl === rawPath) {
            if (m.type !== MediaType.video) {
              galleryThumbs.push(uploadedMainUrl);
            }
          } else if (thumbIsLocalString || thumbIsBlob) {
            const thumbUrl = await cloudMediaService.uploadMedia(m.thumbnailUrl as any, 'posts_media_thumbs', user.id);
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
        const audioPath = audioMedia.path;
        const audioIsLocalString = typeof audioPath === 'string' && (audioPath.startsWith('file://') || audioPath.startsWith('/') || audioPath.startsWith('blob:') || audioPath.startsWith('ph://') || audioPath.startsWith('content://'));
        const audioIsBlob = typeof Blob !== 'undefined' && (audioPath as any) instanceof Blob;
        if (audioIsLocalString || audioIsBlob) {
          console.log('[usePostingStore] ☁️ Uploading audio to Cloudflare R2...');
          const url = await cloudMediaService.uploadMedia(audioPath as any, 'posts_audio', user.id);
          console.log('[usePostingStore] ✅ Audio uploaded:', url);
          finalAudioUrl = url;
        } else {
          finalAudioUrl = typeof audioPath === 'string' ? audioPath : null;
        }

        // Upload the audio cover image (thumbnail)
        if (audioMedia.thumbnailUrl) {
          const audioThumb = audioMedia.thumbnailUrl;
          const thumbIsLocalString = typeof audioThumb === 'string' && (audioThumb.startsWith('file://') || audioThumb.startsWith('/') || audioThumb.startsWith('blob:') || audioThumb.startsWith('ph://') || audioThumb.startsWith('content://'));
          const thumbIsBlob = typeof Blob !== 'undefined' && (audioThumb as any) instanceof Blob;
          if (thumbIsLocalString || thumbIsBlob) {
            const thumbUrl = await cloudMediaService.uploadMedia(audioThumb as any, 'posts_media_thumbs', user.id);
            galleryThumbs.push(thumbUrl);
          } else {
            galleryThumbs.push(audioThumb as string);
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
          
          if (typeof window !== 'undefined' && Platform.OS === 'web') {
            window.dispatchEvent(new CustomEvent('channel_status_posted'));
          }
          DeviceEventEmitter.emit('channel_status_posted');
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
          if (typeof window !== 'undefined' && Platform.OS === 'web') {
            window.dispatchEvent(new CustomEvent('status_posted'));
          }
          DeviceEventEmitter.emit('status_posted');
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
          category: params.category,
        };
        const { error } = await supabase.from('channel_posts').insert(cPostPayload);
        if (error) throw error;

        if (typeof window !== 'undefined' && Platform.OS === 'web') {
          window.dispatchEvent(new CustomEvent('channel_post_created'));
        }
        DeviceEventEmitter.emit('channel_post_created');
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
          category: params.category,
        };
        const { error, data } = await supabase.from('posts').insert(postPayload).select('id').single();
        if (error) throw error;

        // Notify all followers about the new post
        if (data && data.id) {
          try {
            const { data: followers } = await supabase.from('follows').select('follower_id').eq('following_id', user.id);
            if (followers && followers.length > 0) {
              const notifications = followers.map(f => ({
                recipient_id: f.follower_id,
                actor_id: user.id,
                type: 'post',
                action_text: isVideo ? 'posted one of their favorite videos.' : (finalAudioUrl ? 'posted one of their favorite songs.' : (finalImageUrls.length > 0 ? 'posted one of their favorite photos.' : 'published a new post.')),
                reference_id: data.id
              }));
              // Insert in chunks of 1000 if needed, but a single batch is usually fine for most users
              await supabase.from('notifications').insert(notifications);
            }
          } catch (notifErr) {
            console.warn('[usePostingStore] Failed to send notifications:', notifErr);
          }
        }
      }

      // All done!
      if (Platform.OS !== 'web') await notificationService.showUploadProgress(taskId, 95);
      if (Platform.OS !== 'web') await notificationService.finishUpload(taskId);

      // Remove the optimistic pending post — the real post is now in the feed
      if (pendingPostId) {
        if (Platform.OS !== 'web') {
          NativeDB.deleteFromDiscoveryFeed(pendingPostId).catch(e => console.warn('[usePostingStore] DB delete err:', e));
        }
        set((state) => ({
          isPosting: false,
          pendingPosts: state.pendingPosts.filter(p => p.id !== pendingPostId),
        }));
      } else {
        set({ isPosting: false });
      }
      return true;
    } catch (e: any) {
      console.error('[usePostingStore] createPost caught error:', e);
      // Fire a real native OS failure notification — visible even outside the app
      if (Platform.OS !== 'web') {
        notificationService.showFailureNotification(taskId).catch(console.warn);
      }
      // Remove the ghost pending post so broken posts don't linger in the feed
      if (pendingPostId) {
        if (Platform.OS !== 'web') {
          NativeDB.deleteFromDiscoveryFeed(pendingPostId).catch(e => console.warn('[usePostingStore] DB delete err:', e));
        }
        set((state) => ({
          isPosting: false,
          errorMessage: e.message,
          pendingPosts: state.pendingPosts.filter(p => p.id !== pendingPostId),
        }));
      } else {
        set({ isPosting: false, errorMessage: e.message });
      }
      return false;
    }
  },
}));
