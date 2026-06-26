import { create } from 'zustand';

interface DesktopVidsState {
  activeVideoId: string | null;
  activeChannelId: string | null;
  activeChannelName: string | null;
  setActiveVideo: (id: string | null, channelId?: string, channelName?: string) => void;
}

export const useDesktopVidsStore = create<DesktopVidsState>((set) => ({
  activeVideoId: null,
  activeChannelId: null,
  activeChannelName: null,
  setActiveVideo: (id, channelId, channelName) => set({ 
    activeVideoId: id, 
    activeChannelId: channelId || null,
    activeChannelName: channelName || null
  }),
}));
