import { create } from 'zustand';
import { supabase } from '../supabase/client';
import { GlobalSearchResult } from '@/explore/models/GlobalSearchResult';

interface SearchState {
  query: string;
  results: GlobalSearchResult[];
  isSearching: boolean;
  hasSearched: boolean;
  
  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
let currentSearchAborter: AbortController | null = null;

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  isSearching: false,
  hasSearched: false,

  setQuery: (query) => {
    set({ query });
  },

  clearSearch: () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (currentSearchAborter) currentSearchAborter.abort();
    set({ query: '', results: [], isSearching: false, hasSearched: false });
  },

  search: async (query: string) => {
    set({ query });

    const trimmed = query.trim();
    if (!trimmed) {
      get().clearSearch();
      return;
    }

    set({ isSearching: true, hasSearched: true });

    // Debounce
    if (searchTimeout) clearTimeout(searchTimeout);
    if (currentSearchAborter) currentSearchAborter.abort();

    currentSearchAborter = new AbortController();
    const abortSignal = currentSearchAborter.signal;

    searchTimeout = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .rpc('search_everything', { search_term: trimmed })
          .abortSignal(abortSignal as any); // Type cast due to supabase-js types 

        if (abortSignal.aborted) return;

        if (error) {
           if (error.message?.includes('AbortError')) return;
           throw error;
        }

        set({ results: (data as GlobalSearchResult[]) || [], isSearching: false });
      } catch (e: any) {
        if (!abortSignal.aborted) {
          console.error('[useSearchStore] Search error:', e);
          set({ results: [], isSearching: false });
        }
      }
    }, 300); // 300ms debounce
  },
}));
