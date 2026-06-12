import { create } from 'zustand';
import { SocialFeedItem } from '../domain/entities/SocialFeedItem';
import { FeedRemoteSource } from '../data/sources/FeedRemoteSource';

interface SocialFeedState {
  items: SocialFeedItem[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  newCount: number;
  
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  clearError: () => void;
}

const PAGE_SIZE = 15;

export const useSocialFeed = create<SocialFeedState>((set, get) => ({
  items: [],
  isLoading: false,
  hasMore: true,
  error: null,
  newCount: 0,

  loadInitial: async () => {
    set({ isLoading: true, error: null });

    try {
      console.log('💾 [useSocialFeed] FETCHING INITIAL PAGE FROM SUPABASE');
      const items = await FeedRemoteSource.getDiscoveryFeed(PAGE_SIZE, 0);

      set({
        items,
        isLoading: false,
        hasMore: items.length >= PAGE_SIZE,
        newCount: get().newCount + items.length
      });
    } catch (e: any) {
      console.error('❌ [useSocialFeed] ERROR loading initial:', e);
      set({ isLoading: false, error: e.message || 'Failed to load feed' });
    }
  },

  loadMore: async () => {
    const state = get();
    if (state.isLoading || !state.hasMore) return;

    set({ isLoading: true, error: null });

    try {
      console.log(`➕ [useSocialFeed] Requesting next page: offset=${state.items.length}`);
      const nextItems = await FeedRemoteSource.getDiscoveryFeed(PAGE_SIZE, state.items.length);

      set({
        items: [...state.items, ...nextItems],
        isLoading: false,
        hasMore: nextItems.length === PAGE_SIZE
      });
    } catch (e: any) {
      console.error('❌ [useSocialFeed] ERROR loading more:', e);
      set({ isLoading: false, error: e.message || 'Failed to load more items' });
    }
  },

  clearError: () => set({ error: null })
}));
