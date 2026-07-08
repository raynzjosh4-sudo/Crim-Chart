import { NativeDB } from '@/core/db/NativeDB';
import { syncQueue } from '@/core/db/SyncQueue';
import { channelRepository } from '@/channel/data/channelRepository';
import { DeviceEventEmitter, Platform } from 'react-native';
import 'react-native-get-random-values';
import Toast from 'react-native-toast-message';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

export enum ChannelCreationStatus {
  idle,
  processing,
  success,
  error,
}

export interface ChannelCreationState {
  status: ChannelCreationStatus;
  error: string | null;
}

interface ChannelCreationStore extends ChannelCreationState {
  draftCountries: string[];
  setDraftCountries: (countries: string[]) => void;
  draftAge: string;
  setDraftAge: (age: string) => void;
  createChannel: (params: {
    name: string;
    description: string;
    mediaPath?: string | null;
    ageRestriction: string;
    membersOtherChannels: boolean;
    membersFollowing: boolean;
    joinMethod: string;
    preventLeaving: boolean;
    countryRestrictions: string[];
    allowCommentingBy: string;
  }) => Promise<void>;
  reset: () => void;
}

export const useChannelCreationController = create<ChannelCreationStore>((set) => ({
  status: ChannelCreationStatus.idle,
  error: null,
  draftCountries: ['Global'],
  setDraftCountries: (countries) => set({ draftCountries: countries }),
  draftAge: 'All Ages',
  setDraftAge: (age) => set({ draftAge: age }),

  createChannel: async (params) => {
    console.log('🚀 SENDING DATA TO CONTROLLER:', params.name);

    set({ status: ChannelCreationStatus.processing, error: null });

    try {
      if (Platform.OS === 'web') {
        // On web there is no SQLite — call Supabase directly
        await channelRepository.createChannel(
          {
            name: params.name,
            description: params.description,
            age_restriction: params.ageRestriction,
            visible_to_other_channel_members: params.membersOtherChannels,
            visible_to_followed_users: params.membersFollowing,
            join_method: params.joinMethod,
            prevent_leaving: params.preventLeaving,
            country_restrictions: params.countryRestrictions,
            allow_commenting_by: params.allowCommentingBy,
            allow_status_posting_by: 'all',
            allow_invitations_by: 'all',
          },
          params.mediaPath || null
        );
      } else {
        // On mobile: offline-first — write to SQLite then enqueue background sync
        const channelId = uuidv4();
        const channelData = {
          id: channelId,
          creator_id: 'pending_user_id',
          name: params.name,
          description: params.description,
          avatar_url: params.mediaPath || null,
          age_restriction: params.ageRestriction,
          visible_to_other_channel_members: params.membersOtherChannels,
          visible_to_followed_users: params.membersFollowing,
          join_method: params.joinMethod,
          prevent_leaving: params.preventLeaving,
          country_restrictions: params.countryRestrictions,
          allow_commenting_by: params.allowCommentingBy,
          allow_status_posting_by: 'all',
          allow_invitations_by: 'all',
          created_at: Date.now(),
          sync_status: 'PENDING',
        };

        await NativeDB.createChannelLocal(channelData);

        await syncQueue.enqueueTask({
          type: 'CREATE_CHANNEL',
          payload: {
            ...channelData,
            localMediaPath: params.mediaPath,
          },
        });
      }

      set({ status: ChannelCreationStatus.success });
      DeviceEventEmitter.emit('channel_created');

      Toast.show({
        type: 'chartToast',
        text1: 'Channel Creating',
        text2: `Syncing ${params.name} in the background`,
        position: 'bottom',
        bottomOffset: 100,
      });
    } catch (e: any) {
      console.error('⛔ CONTROLLER CRITICAL ERROR:', e);
      set({ status: ChannelCreationStatus.error, error: e.message || 'Creation failed' });

      Toast.show({
        type: 'error',
        text1: 'Creation Failed',
        text2: e.message || 'Could not create channel',
        position: 'bottom',
      });
    }
  },

  reset: () => {
    set({ status: ChannelCreationStatus.idle, error: null });
  }
}));
