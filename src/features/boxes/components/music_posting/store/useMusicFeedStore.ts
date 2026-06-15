import { create } from 'zustand';
import { MusicTrackItem } from '../tiles/MusicListTile';
import { FeedRemoteSource } from '@/features/feed/data/sources/FeedRemoteSource';
import { useInteractionStore } from '@/core/store/useInteractionStore';

interface MusicFeedState {
  globalTracks: MusicTrackItem[];
  globalPage: number;
  hasMoreGlobal: boolean;
  isLoadingGlobal: boolean;
  isInitialLoad: boolean;
  loadGlobalMusic: (boxId: string) => Promise<void>;
  resetFeed: () => void;
  addTrackToTop: (track: MusicTrackItem) => void;
}

export const useMusicFeedStore = create<MusicFeedState>((set, get) => ({
  globalTracks: [],
  globalPage: 1,
  hasMoreGlobal: true,
  isLoadingGlobal: false,
  isInitialLoad: true, // Used to show big shimmer

  resetFeed: () => set({
    globalTracks: [],
    globalPage: 1,
    hasMoreGlobal: true,
    isLoadingGlobal: false,
    isInitialLoad: true
  }),

  addTrackToTop: (track: MusicTrackItem) => {
    const { globalTracks } = get();
    // Prepend the new track so it appears immediately at the top
    set({ globalTracks: [track, ...globalTracks] });
  },

  loadGlobalMusic: async (boxId: string) => {
    const { globalPage, hasMoreGlobal, isLoadingGlobal, globalTracks } = get();
    if (!hasMoreGlobal || isLoadingGlobal) return;
    
    set({ isLoadingGlobal: true });
    
    try {
      const feed = await FeedRemoteSource.getMusicFeed(globalPage, 10);
      const mapped: MusicTrackItem[] = feed.map(post => ({
        id: post.id,
        title: post.metadata?.title || post.caption || 'Audio Track',
        artist: post.author?.displayName || 'Unknown Artist',
        coverUrl: post.metadata?.coverUrl || post.imageUrls?.[0] || post.thumbnailUrls?.[0] || '',
        audioUrl: post.audioUrl || '',
        duration: '0:00', // We might not have duration from DB
        owner: {
          id: post.author?.id || '',
          name: post.author?.displayName || '',
          avatarUrl: post.author?.profileImageUrl || ''
        },
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        viewsCount: post.viewsCount,
        downloadsCount: post.downloadsCount || 0
      }));

      // Sync interaction state
      useInteractionStore.getState().syncPostInteractions(mapped.map(i => i.id), boxId);

      set({
        globalTracks: [...globalTracks, ...mapped],
        hasMoreGlobal: feed.length === 10,
        globalPage: globalPage + 1
      });
    } catch (e) {
      console.error("Failed to load global music", e);
    } finally {
      set({ isLoadingGlobal: false, isInitialLoad: false });
    }
  }
}));
