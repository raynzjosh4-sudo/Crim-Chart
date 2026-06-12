import { create } from 'zustand';
import { MediaItem } from './models/MediaItem';
import { MediaBakingService } from './MediaBakingService';
import { SyncQueue } from '@/core/db/SyncQueue';

export enum PostingStatus {
  idle = 'idle',
  processing = 'processing',
  success = 'success',
  error = 'error'
}

interface PostingState {
  status: PostingStatus;
  progress: number;
  error?: string;
  createPost: (params: CreatePostParams) => Promise<void>;
  reset: () => void;
  updateProgress: (progress: number) => void;
}

export interface CreatePostParams {
  userId: string;
  media: MediaItem[];
  caption: string;
  channelId?: string;
  channelName?: string;
  isMyChannel?: boolean;
  postType?: string;
  parentPostId?: string;
  channels?: string[];
  privacy?: string;
  customRole?: string;
  isPublicFeed?: boolean;
  allowComments?: boolean;
  shareToStatus?: boolean;
  shareToMoment?: boolean;
  linkedPostId?: string;
  linkedAuthorUsername?: string;
  linkedCaption?: string;
  linkedChannelId?: string;
  linkedThumbnailUrls?: string[];
  aspectRatio?: number;
}

export const usePostingController = create<PostingState>((set, get) => ({
  status: PostingStatus.idle,
  progress: 0,
  error: undefined,

  reset: () => set({ status: PostingStatus.idle, progress: 0, error: undefined }),

  updateProgress: (progress: number) => set({ progress }),

  createPost: async (params) => {
    set({ status: PostingStatus.processing, progress: 0.1, error: undefined });
    try {
      // 1. Media Baking & Upload
      const uploadResults = await MediaBakingService.uploadMediaAssets(
        params.userId,
        params.media,
        (progress) => set({ progress: 0.1 + progress * 0.8 }) // 10% to 90% is upload
      );

      // 2. Shape the final post metadata
      const postData = MediaBakingService.shapeFinalPostData(params, uploadResults);

      // 3. Queue for sync
      SyncQueue.addTask('CREATE_POST', postData);

      set({ status: PostingStatus.success, progress: 1.0 });
    } catch (error: any) {
      set({ status: PostingStatus.error, error: error.message || 'Unknown error' });
    }
  }
}));
