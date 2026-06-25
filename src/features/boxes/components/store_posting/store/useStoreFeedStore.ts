import { useInteractionStore } from '@/core/store/useInteractionStore';
import { FeedRemoteSource } from '@/features/feed/data/sources/FeedRemoteSource';
import { create } from 'zustand';
import { StoreItem } from '@/features/boxes/data/dummyStoreBoxData';
interface StoreFeedState {
  globalStoreItems: StoreItem[];
  globalPage: number;
  hasMoreGlobal: boolean;
  isLoadingGlobal: boolean;
  isInitialLoad: boolean;
  loadGlobalItems: (boxId: string) => Promise<void>;
  resetFeed: () => void;
  addItemToTop: (item: StoreItem) => void;
}

export const useStoreFeedStore = create<StoreFeedState>((set, get) => ({
  globalStoreItems: [],
  globalPage: 1,
  hasMoreGlobal: true,
  isLoadingGlobal: false,
  isInitialLoad: true, // Used to show big shimmer

  resetFeed: () => set({
    globalStoreItems: [],
    globalPage: 1,
    hasMoreGlobal: true,
    isLoadingGlobal: false,
    isInitialLoad: true
  }),

  addItemToTop: (item: StoreItem) => {
    const { globalStoreItems } = get();
    set({ globalStoreItems: [item, ...globalStoreItems] });
  },

  loadGlobalItems: async (boxId: string) => {
    const { globalPage, hasMoreGlobal, isLoadingGlobal, globalStoreItems } = get();
    if (!hasMoreGlobal || isLoadingGlobal) return;

    set({ isLoadingGlobal: true });

    try {
      const feed = await FeedRemoteSource.getStoreFeed(globalPage, 10);
      const mapped: StoreItem[] = feed.map(post => ({
        id: post.id,
        title: post.metadata?.title || 'Store Item',
        description: post.caption || '',
        price: post.metadata?.price || '',
        mediaUrl: post.imageUrls?.[0] || post.thumbnailUrls?.[0] || '',
        seller: {
          id: post.author?.id || '',
          name: post.author?.displayName || '',
          avatarUrl: post.author?.profileImageUrl || ''
        },
        likes: post.likesCount,
        commentsCount: post.commentsCount,
        viewsCount: post.viewsCount
      }));

      // Sync interaction state for tagging logic
      useInteractionStore.getState().syncPostInteractions(mapped.map(i => i.id), boxId);

      set({
        globalStoreItems: [...globalStoreItems, ...mapped],
        hasMoreGlobal: feed.length === 10,
        globalPage: globalPage + 1
      });
    } catch (e) {
      console.error("Failed to load global store feed", e);
    } finally {
      set({ isLoadingGlobal: false, isInitialLoad: false });
    }
  }
}));
