import { create } from 'zustand';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { FeedRemoteSource } from '../data/sources/FeedRemoteSource';

interface DiscoveryChannelsState {
  channels: CrimChartUserModel[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  clearError: () => void;
}

const PAGE_SIZE = 20;

export const useDiscoveryChannels = create<DiscoveryChannelsState>((set, get) => ({
  channels: [],
  isLoading: false,
  hasMore: true,
  error: null,

  loadInitial: async () => {
    set({ isLoading: true, error: null });

    try {
      console.log('🏘️ [useDiscoveryChannels] FETCHING INITIAL PAGE FROM SUPABASE');
      const channels = await FeedRemoteSource.getDiscoveryChannels(PAGE_SIZE, 0);

      set({
        channels,
        isLoading: false,
        hasMore: channels.length >= PAGE_SIZE
      });
    } catch (e: any) {
      console.error('❌ [useDiscoveryChannels] ERROR loading initial:', e);
      set({ isLoading: false, error: e.message || 'Failed to load channels' });
    }
  },

  loadMore: async () => {
    const state = get();
    if (state.isLoading || !state.hasMore) return;

    set({ isLoading: true, error: null });

    try {
      console.log(`➕ [useDiscoveryChannels] Requesting next page: offset=${state.channels.length}`);
      const nextChannels = await FeedRemoteSource.getDiscoveryChannels(PAGE_SIZE, state.channels.length);

      set({
        channels: [...state.channels, ...nextChannels],
        isLoading: false,
        hasMore: nextChannels.length === PAGE_SIZE
      });
    } catch (e: any) {
      console.error('❌ [useDiscoveryChannels] ERROR loading more:', e);
      set({ isLoading: false, error: e.message || 'Failed to load more channels' });
    }
  },

  clearError: () => set({ error: null })
}));
