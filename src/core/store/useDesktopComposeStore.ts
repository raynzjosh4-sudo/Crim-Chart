import { create } from 'zustand';

export interface ComposeModalOptions {
  postType?: string; // 'feed', 'channel', 'channel_status', 'status', 'manifesto'
  targetChannelId?: string;
  channelName?: string;
  channelAvatarUrl?: string;
  initialText?: string;
  isManifestoContext?: boolean;
}

interface DesktopComposeStore {
  isOpen: boolean;
  options: ComposeModalOptions | null;
  openModal: (options?: ComposeModalOptions) => void;
  closeModal: () => void;
}

export const useDesktopComposeStore = create<DesktopComposeStore>((set) => ({
  isOpen: false,
  options: null,
  openModal: (options) => set({ isOpen: true, options: options || null }),
  closeModal: () => set({ isOpen: false, options: null }),
}));
