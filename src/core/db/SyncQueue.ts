import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/core/supabase/supabaseConfig';
import { notificationService } from '../notifications/NotificationService';
import { cloudMediaService } from '@/core/network/cloudMediaService';
import { channelRepository } from '../../channel/data/channelRepository';
import { NativeDB } from './NativeDB';

export type SyncActionType = 'LIKE_POST' | 'CREATE_POST' | 'SEND_MESSAGE' | 'UPDATE_PROFILE' | 'CREATE_CHANNEL';

export interface SyncTask {
  id: string;
  type: SyncActionType;
  payload: any;
  createdAt: number;
  retryCount: number;
}

export class SyncQueue {
  private static readonly QUEUE_KEY = 'offline_sync_queue';
  private static isSyncing = false;

  static async getQueue(): Promise<SyncTask[]> {
    try {
      const data = await AsyncStorage.getItem(this.QUEUE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static async saveQueue(queue: SyncTask[]) {
    await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }

  static async enqueueTask(taskInput: { type: SyncActionType, payload: any }) {
    const queue = await this.getQueue();
    const task: SyncTask = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: taskInput.type,
      payload: taskInput.payload,
      createdAt: Date.now(),
      retryCount: 0,
    };
    
    queue.push(task);
    await this.saveQueue(queue);
    
    // Attempt to sync immediately if online
    this.processQueue();
  }

  static async processQueue() {
    if (this.isSyncing) return;
    
    const queue = await this.getQueue();
    if (queue.length === 0) return;

    // Ensure notifications are initialized
    await notificationService.init();

    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      // If offline, notify the user that pending tasks are paused
      for (const task of queue) {
        let title = 'Syncing Data...';
        if (task.type === 'CREATE_POST') title = 'Uploading Post...';
        if (task.type === 'SEND_MESSAGE') title = 'Sending Message...';
        if (task.type === 'CREATE_CHANNEL') title = 'Paused - Waiting for network connection';
        
        await notificationService.setUploadPaused(task.id, title);
      }
      return;
    }

    this.isSyncing = true;
    const remainingQueue: SyncTask[] = [];

    for (const task of queue) {
      try {
        await this.executeTask(task);
      } catch (error) {
        console.warn(`[SyncQueue] Task failed: ${task.type}`, error);
        if (task.retryCount < 5) {
          remainingQueue.push({ ...task, retryCount: task.retryCount + 1 });
        }
      }
    }

    await this.saveQueue(remainingQueue);
    this.isSyncing = false;
  }

  private static async executeTask(task: SyncTask) {
    switch (task.type) {
      case 'LIKE_POST':
        await supabase.rpc('toggle_like', { post_id: task.payload.postId });
        break;
      case 'CREATE_POST':
        await supabase.from('posts').insert(task.payload);
        break;
      case 'SEND_MESSAGE':
        await supabase.from('messages').insert(task.payload);
        break;
      case 'UPDATE_PROFILE':
        await supabase.from('profiles').update(task.payload.updates).eq('id', task.payload.userId);
        break;
      case 'CREATE_CHANNEL':
        let finalMediaUrl: string | null = task.payload.avatar_url;
        
        // 1. Upload media if local path exists
        if (task.payload.localMediaPath && !task.payload.localMediaPath.startsWith('http')) {
          finalMediaUrl = await cloudMediaService.uploadMedia(task.payload.localMediaPath, 'channel_avatars', undefined, task.id);
        }

        // 2. Push to Supabase via Repository
        await channelRepository.createChannel({
          name: task.payload.name,
          description: task.payload.description,
          age_restriction: task.payload.age_restriction,
          visible_to_other_channel_members: !!task.payload.visible_to_other_channel_members,
          visible_to_followed_users: !!task.payload.visible_to_followed_users,
          join_method: task.payload.join_method,
          prevent_leaving: !!task.payload.prevent_leaving,
          country_restrictions: task.payload.country_restrictions,
          allow_commenting_by: task.payload.allow_commenting_by,
          allow_status_posting_by: task.payload.allow_status_posting_by,
          allow_invitations_by: task.payload.allow_invitations_by,
        }, finalMediaUrl);

        // 3. Update Local NativeDB status
        const db = require('./database').dbService.database;
        await db.runAsync(`UPDATE channels SET sync_status = 'SYNCED', avatar_url = ? WHERE id = ?`, [finalMediaUrl, task.payload.id]);
        break;
      default:
        console.warn(`[SyncQueue] Unknown task type: ${task.type}`);
    }
  }
}

export const syncQueue = SyncQueue;
