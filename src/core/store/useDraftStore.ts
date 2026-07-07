import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeDB } from '@/core/db/NativeDB';

export interface Draft {
  id: string;
  text: string;
  media: any[]; // serialized as JSON
  post_type: string;
  created_at: string;
}

interface DraftStore {
  drafts: Draft[];
  loadDrafts: () => Promise<void>;
  saveDraft: (draft: Omit<Draft, 'id' | 'created_at'>) => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
}

export const useDraftStore = create<DraftStore>((set) => ({
  drafts: [],
  
  loadDrafts: async () => {
    try {
      if (Platform.OS === 'web') {
        const data = await AsyncStorage.getItem('web_drafts');
        if (data) set({ drafts: JSON.parse(data) });
      } else {
        const rows = await NativeDB.getDrafts();
        const drafts = rows.map(r => ({
          ...r,
          media: r.media ? JSON.parse(r.media) : []
        }));
        set({ drafts });
      }
    } catch (e) {
      console.warn('Failed to load drafts', e);
    }
  },

  saveDraft: async (draftData) => {
    const newDraft: Draft = {
      ...draftData,
      id: `draft_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    
    set(state => {
      const newDrafts = [newDraft, ...state.drafts];
      if (Platform.OS === 'web') {
        AsyncStorage.setItem('web_drafts', JSON.stringify(newDrafts)).catch(console.warn);
      } else {
        NativeDB.saveDraft({
          id: newDraft.id,
          text: newDraft.text,
          media: JSON.stringify(newDraft.media),
          post_type: newDraft.post_type,
          created_at: newDraft.created_at
        }).catch(console.warn);
      }
      return { drafts: newDrafts };
    });
  },

  deleteDraft: async (id) => {
    set(state => {
      const newDrafts = state.drafts.filter(d => d.id !== id);
      if (Platform.OS === 'web') {
        AsyncStorage.setItem('web_drafts', JSON.stringify(newDrafts)).catch(console.warn);
      } else {
        NativeDB.deleteDraft(id).catch(console.warn);
      }
      return { drafts: newDrafts };
    });
  }
}));
