import { create } from 'zustand';
import { GuestArtistRow, FeedRemoteSource } from '../data/sources/FeedRemoteSource';

interface GuestFeedState {
  artists: GuestArtistRow[];
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;

  load: () => Promise<void>;
  reset: () => void;
}

export const useGuestFeed = create<GuestFeedState>((set, get) => ({
  artists: [],
  isLoading: false,
  error: null,
  hasFetched: false,

  load: async () => {
    // Only fetch once per session unless reset
    if (get().hasFetched || get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const artists = await FeedRemoteSource.getPublicMusicByArtist(80);
      set({ artists, isLoading: false, hasFetched: true });
    } catch (e: any) {
      console.error('[useGuestFeed] load failed:', e);
      set({ isLoading: false, error: e?.message || 'Failed to load guest feed' });
    }
  },

  reset: () => set({ artists: [], isLoading: false, error: null, hasFetched: false }),
}));
