import { create } from 'zustand';

interface DesktopChannelModalStore {
  channelId: string | null;
  openChannel: (id: string) => void;
  closeChannel: () => void;
}

export const useDesktopChannelModalStore = create<DesktopChannelModalStore>((set) => ({
  channelId: null,
  openChannel: (id) => set({ channelId: id }),
  closeChannel: () => set({ channelId: null }),
}));
