import { create } from 'zustand';
import { useGlobalAudioPlayer } from './useGlobalAudioPlayer';

export interface NowPlayingParams {
  title?: string;
  artist?: string;
  coverUrl?: string;
  audioUrl?: string;
  lyrics?: string;
  postId?: string;
  boxId?: string;
  downloadsCount?: number;
}

interface DesktopNowPlayingState {
  isOpen: boolean;
  queue: NowPlayingParams[];
  originalQueue: NowPlayingParams[];
  currentIndex: number;
  isShuffled: boolean;
  isExpanded: boolean;
  openModal: (queue: NowPlayingParams[], startIndex: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  jumpToTrack: (index: number) => void;
  toggleShuffle: () => void;
  closeModal: () => void;
  setExpanded: (expanded: boolean) => void;
}

export const useDesktopNowPlayingStore = create<DesktopNowPlayingState>((set) => ({
  isOpen: false,
  queue: [],
  originalQueue: [],
  currentIndex: 0,
  isShuffled: false,
  isExpanded: false,
  openModal: (queue, startIndex) => {
    set({ 
      isOpen: true, 
      queue, 
      originalQueue: queue, 
      currentIndex: startIndex,
      isShuffled: false,
      isExpanded: true
    });
  },
  nextTrack: () => set((state) => ({
    currentIndex: Math.min(state.currentIndex + 1, state.queue.length - 1)
  })),
  prevTrack: () => set((state) => ({
    currentIndex: Math.max(state.currentIndex - 1, 0)
  })),
  jumpToTrack: (index) => set((state) => {
    if (index >= 0 && index < state.queue.length) {
      return { currentIndex: index };
    }
    return state;
  }),
  toggleShuffle: () => set((state) => {
    if (!state.isShuffled) {
      // Turn ON shuffle
      const currentTrack = state.queue[state.currentIndex];
      const remainingTracks = state.queue.filter((_, idx) => idx !== state.currentIndex);
      
      // Fisher-Yates shuffle
      for (let i = remainingTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingTracks[i], remainingTracks[j]] = [remainingTracks[j], remainingTracks[i]];
      }
      
      const shuffledQueue = [currentTrack, ...remainingTracks];

      useGlobalAudioPlayer.getState().playTrack(
        currentTrack.postId || '', 
        currentTrack.audioUrl || '',
        {
          title: currentTrack.title || 'Unknown',
          artist: currentTrack.artist || 'Unknown',
          coverUrl: currentTrack.coverUrl || '',
          downloadsCount: currentTrack.downloadsCount
        }
      );

      return {
        isShuffled: true,
        originalQueue: state.queue,
        queue: shuffledQueue,
        currentIndex: 0 // current track is now at index 0
      };
    } else {
      // Turn OFF shuffle
      const currentTrack = state.queue[state.currentIndex];
      const newIndex = state.originalQueue.findIndex(t => t === currentTrack);
      return {
        isShuffled: false,
        queue: state.originalQueue,
        currentIndex: Math.max(0, newIndex)
      };
    }
  }),
  closeModal: () => set({ isOpen: false, queue: [], originalQueue: [], currentIndex: 0, isShuffled: false, isExpanded: false }),
  setExpanded: (expanded) => set({ isExpanded: expanded }),
}));
