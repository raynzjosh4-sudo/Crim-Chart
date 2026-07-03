import { useRouter } from 'expo-router';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { NativeDB } from '@/core/db/NativeDB';
import { setPreloadedMainFeed } from '@/mainFeed/pages/MainFeedPage';
import { Platform } from 'react-native';
import { useDesktopComposeStore } from '@/core/store/useDesktopComposeStore';

export const useAppNavigation = () => {
  const router = useRouter();
  const { startLoading, stopLoading } = useGlobalProgress();

  /**
   * Generic wrapper for ANY action (like opening a Comment Sheet or custom modal).
   * It shows the global loader, executes your pre-fetch logic, adds a tiny premium delay,
   * then hides the loader and lets you open the sheet.
   */
  const withPremiumTransition = async <T>(action: () => Promise<T>): Promise<T | undefined> => {
    startLoading();
    try {
      const result = await action();
      // Premium simulated delay to ensure the UI feels heavy/asynchronous
      await new Promise(resolve => setTimeout(resolve, 400));
      return result;
    } catch (e) {
      console.error('[withPremiumTransition] Error:', e);
    } finally {
      stopLoading();
    }
  };

  const navigateToCrim = async () => {
    startLoading();
    try {
      const cached = await NativeDB.getMainFeed();
      setPreloadedMainFeed(cached);
    } catch (e) {
      console.error(e);
    } finally {
      stopLoading();
      router.navigate('/');
    }
  };

  const navigateToVids = async () => {
    startLoading();
    try {
      // Trigger a local fetch so the DB is hot
      await NativeDB.getDiscoveryFeed();
    } catch (e) {
      console.error(e);
    } finally {
      stopLoading();
      router.navigate('/vids');
    }
  };

  const navigateToChannels = async () => {
    startLoading();
    try {
      // Trigger a local fetch so the DB is hot
      await NativeDB.getChannels();
    } catch (e) {
      console.error(e);
    } finally {
      stopLoading();
      router.navigate('/channels');
    }
  };

  const navigateToCompose = async () => {
    startLoading();
    // Premium simulated delay per rules before opening a modal/sheet
    await new Promise(resolve => setTimeout(resolve, 400));
    stopLoading();
    if (Platform.OS === 'web') {
      useDesktopComposeStore.getState().openModal();
    } else {
      router.navigate('/first-post');
    }
  };

  const navigateToStatuses = async () => {
    startLoading();
    await new Promise(resolve => setTimeout(resolve, 300));
    stopLoading();
    router.navigate('/statuses' as any);
  };

  const navigateToInbox = async () => {
    startLoading();
    await new Promise(resolve => setTimeout(resolve, 300));
    stopLoading();
    router.navigate('/inbox');
  };

  const navigateToMyMusic = async () => {
    startLoading();
    try {
      // Just a short premium delay
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      stopLoading();
      router.navigate('/my-music' as any);
    }
  };

  return {
    withPremiumTransition,
    navigateToCrim,
    navigateToVids,
    navigateToChannels,
    navigateToCompose,
    navigateToStatuses,
    navigateToInbox,
    navigateToMyMusic,
  };
};
