import { create } from 'zustand';
import { NativeDB } from '../db/NativeDB';
import { supabase } from '../supabase/client';

interface FeedState {
  items: any[];
  isLoading: boolean;
  error: string | null;
  fetchFeed: () => Promise<void>;
  refreshFeed: () => Promise<void>;
}

export const useFeedStore = create<FeedState>((set) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchFeed: async () => {
    set({ isLoading: true });
    try {
      // 1. Load from local cache first
      const cachedItems = await NativeDB.getDiscoveryFeed();
      set({ items: cachedItems });

      // 2. Fetch from remote (Supabase)
      // This is a placeholder for the actual RPC call
      const { data, error } = await supabase
        .from('channel_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        // 3. Update local cache
        await NativeDB.upsertDiscoveryFeed(data);
        
        // 4. Update state
        const updatedItems = await NativeDB.getDiscoveryFeed();
        set({ items: updatedItems, isLoading: false });
      }
    } catch (error: any) {
      console.error('🚨 [FeedStore Error] fetchFeed FAILED:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  refreshFeed: async () => {
    set({ isLoading: true });
    try {
      // Direct remote fetch and cache update
      const { data, error } = await supabase
        .from('channel_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        await NativeDB.upsertDiscoveryFeed(data);
        const updatedItems = await NativeDB.getDiscoveryFeed();
        set({ items: updatedItems, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
