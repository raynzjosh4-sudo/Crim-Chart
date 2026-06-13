import { create } from 'zustand';

export interface CachedProfile {
  id: string;
  isOnline: boolean;
  lastSeen: string | null;
  hasStatus: boolean;
  statusCount: number;
  lastFetchedAt: number;
}

interface ProfileCacheState {
  profiles: Record<string, CachedProfile>;
  requestedUserIds: Set<string>;
  
  updateProfile: (id: string, data: Partial<CachedProfile>) => void;
  updateProfiles: (profiles: CachedProfile[]) => void;
  requestSync: (id: string) => void;
  clearRequestedSyncs: (ids: string[]) => void;
  clearAll: () => void;
}

export const useProfileCacheStore = create<ProfileCacheState>((set) => ({
  profiles: {},
  requestedUserIds: new Set(),

  updateProfile: (id, data) => set((state) => ({
    profiles: {
      ...state.profiles,
      [id]: {
        ...(state.profiles[id] || { 
          id, isOnline: false, lastSeen: null, hasStatus: false, statusCount: 0, lastFetchedAt: Date.now() 
        }),
        ...data,
      }
    }
  })),

  updateProfiles: (newProfiles) => set((state) => {
    const updatedProfiles = { ...state.profiles };
    newProfiles.forEach(p => {
      updatedProfiles[p.id] = {
        ...(updatedProfiles[p.id] || { 
          id: p.id, isOnline: false, lastSeen: null, hasStatus: false, statusCount: 0, lastFetchedAt: Date.now() 
        }),
        ...p,
      };
    });
    return { profiles: updatedProfiles };
  }),

  requestSync: (id) => set((state) => {
    const newSet = new Set(state.requestedUserIds);
    newSet.add(id);
    return { requestedUserIds: newSet };
  }),

  clearRequestedSyncs: (ids) => set((state) => {
    const newSet = new Set(state.requestedUserIds);
    ids.forEach(id => newSet.delete(id));
    return { requestedUserIds: newSet };
  }),

  clearAll: () => set({ profiles: {}, requestedUserIds: new Set() }),
}));
