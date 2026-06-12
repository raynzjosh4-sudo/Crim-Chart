import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { SyncQueue } from './SyncQueue';
import { create } from 'zustand';

interface SyncManagerState {
  isOnline: boolean;
  setOnline: (status: boolean) => void;
}

export const useSyncManagerStore = create<SyncManagerState>((set) => ({
  isOnline: true, // assume online initially
  setOnline: (status: boolean) => set({ isOnline: status }),
}));

export const useSyncManager = () => {
  const setOnline = useSyncManagerStore((state) => state.setOnline);

  useEffect(() => {
    // Listen for network changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected ?? false;
      setOnline(online);

      if (online) {
        // Automatically process the queue when we come back online
        SyncQueue.processQueue();
      }
    });

    return () => unsubscribe();
  }, [setOnline]);
};

// Global accessor if needed outside hooks
export const SyncManager = {
  isOnline: () => useSyncManagerStore.getState().isOnline,
};
