import notifee, { AndroidImportance } from '@notifee/react-native';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

class NotificationService {
  private channelId: string = 'posting_channel';

  async init() {
    await notifee.requestPermission();
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: this.channelId,
        name: 'Posting',
        importance: AndroidImportance.DEFAULT,
        vibration: true,
        vibrationPattern: [300, 500],
      });
    }
  }

  /**
   * Shows or updates an ongoing "Posting..." progress notification.
   * @param taskId - unique ID for this post upload
   * @param progress - 0..100
   */
  async showUploadProgress(taskId: string, progress: number) {
    const pct = Math.round(progress);
    if (Platform.OS === 'android') {
      await notifee.displayNotification({
        id: taskId,
        title: `Posting... ${pct}%`,
        body: 'Your post is being uploaded.',
        android: {
          channelId: this.channelId,
          onlyAlertOnce: true,
          ongoing: true,
          progress: { max: 100, current: pct },
        },
      });
    } else {
      if (pct === 0 || pct % 25 === 0) {
        await notifee.displayNotification({
          id: taskId,
          title: `Posting... ${pct}%`,
          body: 'Your post is being uploaded.',
        });
      }
    }
  }

  /**
   * Pauses the notification — shown when there is no internet.
   */
  async showPostPaused(taskId: string) {
    if (Platform.OS === 'android') {
      await notifee.displayNotification({
        id: taskId,
        title: 'Post paused',
        body: 'No internet connection. Will resume automatically.',
        android: {
          channelId: this.channelId,
          onlyAlertOnce: true,
          ongoing: true,
          progress: { max: 0, current: 0, indeterminate: true },
        },
      });
    } else {
      await notifee.displayNotification({
        id: taskId,
        title: 'Post paused',
        body: 'No internet connection. Will resume automatically.',
      });
    }
  }

  /**
   * Shown when network is restored and posting is about to continue.
   */
  async showPostResuming(taskId: string) {
    if (Platform.OS === 'android') {
      await notifee.displayNotification({
        id: taskId,
        title: 'Network restored, posting...',
        body: 'Continuing your upload.',
        android: {
          channelId: this.channelId,
          onlyAlertOnce: true,
          ongoing: true,
          progress: { max: 0, current: 0, indeterminate: true },
        },
      });
    } else {
      await notifee.displayNotification({
        id: taskId,
        title: 'Network restored, posting...',
        body: 'Continuing your upload.',
      });
    }
  }

  /**
   * Shown on successful post. Auto-dismisses after 3 seconds.
   */
  async finishUpload(taskId: string) {
    if (Platform.OS === 'android') {
      await notifee.displayNotification({
        id: taskId,
        title: 'Posted! 🎉',
        body: 'Your post is now live.',
        android: {
          channelId: this.channelId,
          onlyAlertOnce: false,
          ongoing: false,
          progress: undefined,
        },
      });
    } else {
      await notifee.displayNotification({
        id: taskId,
        title: 'Posted! 🎉',
        body: 'Your post is now live.',
      });
    }
    setTimeout(() => notifee.cancelNotification(taskId), 3000);
  }

  /**
   * Shown on failure — a PERSISTENT native OS notification visible outside the app.
   */
  async showFailureNotification(taskId: string) {
    // Cancel the progress notification first
    await notifee.cancelNotification(taskId);
    const failId = `${taskId}-fail`;
    if (Platform.OS === 'android') {
      await notifee.displayNotification({
        id: failId,
        title: 'Post failed',
        body: 'Something went wrong. Please try again.',
        android: {
          channelId: this.channelId,
          onlyAlertOnce: false,
          ongoing: false, // user CAN swipe this away
        },
      });
    } else {
      await notifee.displayNotification({
        id: failId,
        title: 'Post failed',
        body: 'Something went wrong. Please try again.',
      });
    }
  }

  /**
   * Waits until network is available. Resolves as soon as connection is restored.
   */
  waitForNetwork(): Promise<void> {
    return new Promise((resolve) => {
      const unsubscribe = NetInfo.addEventListener((state) => {
        if (state.isConnected && state.isInternetReachable !== false) {
          unsubscribe();
          resolve();
        }
      });
    });
  }
}

export const notificationService = new NotificationService();

