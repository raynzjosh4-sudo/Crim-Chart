import { create } from 'zustand';

interface DesktopVidsState {
  activeVideoId: string | null;
  activeChannelId: string | null;
  activeChannelName: string | null;
  isGlobalMuted: boolean;
  setGlobalIsMuted: (val: boolean) => void;
  setActiveVideo: (id: string | null, channelId?: string, channelName?: string) => void;
}

export const useDesktopVidsStore = create<DesktopVidsState>((set) => ({
  activeVideoId: null,
  activeChannelId: null,
  activeChannelName: null,
  isGlobalMuted: true,
  setGlobalIsMuted: (val) => set({ isGlobalMuted: val }),
  setActiveVideo: (id, channelId, channelName) => set({ 
    activeVideoId: id, 
    activeChannelId: channelId || null,
    activeChannelName: channelName || null
  }),
}));
