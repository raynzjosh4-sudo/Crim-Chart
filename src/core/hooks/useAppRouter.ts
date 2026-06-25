import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { InteractionManager } from 'react-native';

/**
 * A custom wrapper around expo-router's useRouter that prevents double-navigation
 * and defers heavy transitions until interactions (like button taps) are complete.
 */
export function useAppRouter() {
  const router = useRouter();
  const isNavigating = useRef(false);

  const safeNavigate = useCallback((action: () => void) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    
    // Defer the heavy navigation work until after current interactions (like button press animations)
    InteractionManager.runAfterInteractions(() => {
      action();
      // Allow navigation again after a short delay (e.g. screen transition time)
      setTimeout(() => {
        isNavigating.current = false;
      }, 500); 
    });

    // Fallback: in case runAfterInteractions gets blocked, reset after a timeout anyway
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  }, []);

  return {
    ...router,
    push: (href: any, options?: any) => safeNavigate(() => router.push(href, options)),
    replace: (href: any, options?: any) => safeNavigate(() => router.replace(href, options)),
    back: () => safeNavigate(() => router.back()),
  };
}
