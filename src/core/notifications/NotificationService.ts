// import notifee, { AndroidImportance, AndroidProgress } from '@notifee/react-native';
import { Platform } from 'react-native';

class NotificationService {
  private channelId: string = 'sync_queue_vibrate';

  async init() {
  }

  async showUploadProgress(taskId: string, title: string, progress: number, max: number = 100) {
  }

  async setUploadPaused(taskId: string, title: string) {
  }

  async finishUpload(taskId: string, title: string) {
  }
}

export const notificationService = new NotificationService();
