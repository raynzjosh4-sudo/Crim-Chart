import { create } from 'zustand';
import { FeedRemoteSource } from '@/features/feed/data/sources/FeedRemoteSource';
import { useInteractionStore } from '@/core/store/useInteractionStore';

export interface VideoFeedItem {
  id: string;
  title: string;
  director: string;
  thumbnailUrl: string;
  duration: string;
  description?: string;
  likes: number;
  dislikes: number;
  commentsCount?: number;
  viewsCount?: number;
  createdAt?: string;
  videoUrl?: string;
  isShort?: boolean;
  addedBy?: {
    id: string;
    name: string;
    avatarUrl: string;
  };
}

interface VideoFeedState {
  globalVideos: VideoFeedItem[];
  globalPage: number;
  hasMoreGlobal: boolean;
  isLoadingGlobal: boolean;
  isInitialLoad: boolean;
  loadGlobalVideos: (boxId: string) => Promise<void>;
  resetFeed: () => void;
  addVideoToTop: (video: VideoFeedItem) => void;
}

export const useVideoFeedStore = create<VideoFeedState>((set, get) => ({
  globalVideos: [],
  globalPage: 1,
  hasMoreGlobal: true,
  isLoadingGlobal: false,
  isInitialLoad: true, // Used to show big shimmer

  resetFeed: () => set({
    globalVideos: [],
    globalPage: 1,
    hasMoreGlobal: true,
    isLoadingGlobal: false,
    isInitialLoad: true
  }),

  addVideoToTop: (video: VideoFeedItem) => {
    const { globalVideos } = get();
    // Prepend the new video so it appears immediately at the top
    set({ globalVideos: [video, ...globalVideos] });
  },

  loadGlobalVideos: async (boxId: string) => {
    const { globalPage, hasMoreGlobal, isLoadingGlobal, globalVideos } = get();
    if (!hasMoreGlobal || isLoadingGlobal) return;
    
    set({ isLoadingGlobal: true });
    
    try {
      const feed = await FeedRemoteSource.getVideoFeed(globalPage, 10);
      const mapped: VideoFeedItem[] = feed.map(post => ({
        id: post.id,
        title: post.metadata?.title || post.caption || 'Video Post',
        director: post.author?.displayName || 'Unknown Creator',
        thumbnailUrl: post.metadata?.coverUrl || post.thumbnailUrls?.[0] || '',
        videoUrl: post.videoUrl || post.videoUrls?.[0] || post.imageUrls?.[0] || '',
        isShort: true, // Assuming videos fetched here can be treated as shorts, or derive from metadata
        duration: '0:00', // We might not have duration from DB
        addedBy: {
          id: post.author?.id || '',
          name: post.author?.displayName || '',
          avatarUrl: post.author?.profileImageUrl || ''
        },
        likes: post.likesCount,
        dislikes: 0,
        commentsCount: post.commentsCount,
        viewsCount: post.viewsCount,
        createdAt: post.createdAt?.toISOString(),
      }));

      // Sync interaction state
      useInteractionStore.getState().syncPostInteractions(mapped.map(i => i.id), boxId);

      set({
        globalVideos: [...globalVideos, ...mapped],
        hasMoreGlobal: feed.length === 10,
        globalPage: globalPage + 1
      });
    } catch (e) {
      console.error("Failed to load global videos", e);
    } finally {
      set({ isLoadingGlobal: false, isInitialLoad: false });
    }
  }
}));
