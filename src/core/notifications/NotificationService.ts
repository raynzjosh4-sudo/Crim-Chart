import notifee, { AndroidImportance, AndroidProgress } from '@notifee/react-native';
import { Platform } from 'react-native';

class NotificationService {
  private channelId: string = 'sync_queue_vibrate';

  async init() {
    // Request permissions (required for iOS and Android 13+)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: this.channelId,
        name: 'Background Sync Tasks',
        importance: AndroidImportance.DEFAULT, // DEFAULT importance allows sound/vibration
        vibration: true,
        vibrationPattern: [300, 500], // Vibrate for 300ms, pause for 500ms
      });
    }
  }

  /**
   * Displays or updates an ongoing notification with a progress bar.
   */
  async showUploadProgress(taskId: string, title: string, progress: number, max: number = 100) {
    if (Platform.OS === 'android') {
      await notifee.displayNotification({
        id: taskId,
        title: title,
        body: 'Syncing in background...',
        android: {
          channelId: this.channelId,
          onlyAlertOnce: true,
          ongoing: true, // Prevents the user from swiping it away
          progress: {
            max,
            current: progress,
          },
          // Optional: Add actions if you want the user to be able to pause/cancel from the notification tray
        },
      });
    } else {
      // iOS does not support progress bars natively in notifications.
      // We just show a text notification that updates occasionally.
      if (progress === 0 || progress === 50) {
        await notifee.displayNotification({
          id: taskId,
          title: title,
          body: `Syncing... ${Math.round((progress / max) * 100)}%`,
        });
      }
    }
  }

  /**
   * Updates the notification to show a "Paused" state (e.g. no internet)
   */
  async setUploadPaused(taskId: string, title: string) {
    if (Platform.OS === 'android') {
      await notifee.displayNotification({
        id: taskId,
        title: title,
        body: 'Paused - Waiting for network connection',
        android: {
          channelId: this.channelId,
          onlyAlertOnce: true,
          ongoing: true, // Still can't swipe away, it's pending
          progress: {
            max: 0,
            current: 0,
            indeterminate: true, // Shows an infinite loading bar
          },
        },
      });
    } else {
      await notifee.displayNotification({
        id: taskId,
        title: title,
        body: 'Paused - Waiting for network connection',
      });
    }
  }

  /**
   * Finishes the upload, turning off the ongoing flag so it can be swiped away,
   * or removes it automatically.
   */
  async finishUpload(taskId: string, title: string) {
    if (Platform.OS === 'android') {
      await notifee.displayNotification({
        id: taskId,
        title: title,
        body: 'Sync Complete!',
        android: {
          channelId: this.channelId,
          onlyAlertOnce: false, // Set to false to allow vibration on completion
          ongoing: false, // Now the user can swipe it away
          progress: undefined, // Remove progress bar
        },
      });
      
      // Alternatively, to auto-remove it after 3 seconds:
      setTimeout(() => {
        notifee.cancelNotification(taskId);
      }, 3000);
    } else {
      await notifee.displayNotification({
        id: taskId,
        title: title,
        body: 'Sync Complete!',
      });
      setTimeout(() => {
        notifee.cancelNotification(taskId);
      }, 3000);
    }
  }
}

export const notificationService = new NotificationService();
