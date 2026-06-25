import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { AuthRemoteSource } from '@/features/auth/data/sources/AuthRemoteSource';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export function useAppPresence() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // We only want to run presence updates if the user is actually logged in
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const user = useAuthStore.getState().user;
      if (!user) return;

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground!
        // console.log('[Presence] App foregrounded. Setting is_online = true');
        await AuthRemoteSource.updateOnlineStatus(true);
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App has gone to the background!
        // console.log('[Presence] App backgrounded. Setting is_online = false');
        await AuthRemoteSource.updateOnlineStatus(false);
      }

      appState.current = nextAppState;
    };

    // Trigger initial online status if app starts active
    if (appState.current === 'active') {
      const user = useAuthStore.getState().user;
      if (user) {
         AuthRemoteSource.updateOnlineStatus(true);
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);
}
