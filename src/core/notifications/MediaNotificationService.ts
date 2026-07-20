import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform } from 'react-native';
import { useGlobalAudioPlayer } from '@/core/store/useGlobalAudioPlayer';
import { useDesktopNowPlayingStore } from '@/core/store/useDesktopNowPlayingStore';

class MediaNotificationServiceImpl {
  private channelId = 'media_playback';
  private initialized = false;

  async init() {
    if (Platform.OS !== 'android') return;
    if (this.initialized) return;

    await notifee.requestPermission();
    await notifee.createChannel({
      id: this.channelId,
      name: 'Media Playback',
      importance: AndroidImportance.LOW, // Low importance so it doesn't pop up over the screen
      vibration: false,
    });

    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.ACTION_PRESS && detail.pressAction) {
        if (detail.pressAction.id === 'media_play') {
          useGlobalAudioPlayer.getState().resumeCurrent();
        } else if (detail.pressAction.id === 'media_pause') {
          useGlobalAudioPlayer.getState().pauseCurrent();
        } else if (detail.pressAction.id === 'media_next') {
          useDesktopNowPlayingStore.getState().nextTrack();
        } else if (detail.pressAction.id === 'media_prev') {
          useDesktopNowPlayingStore.getState().prevTrack();
        }
      }
    });

    this.initialized = true;
  }

  async displayMediaNotification(
    track: { title: string; artist: string; coverUrl?: string },
    isPlaying: boolean,
    hasPrev: boolean,
    hasNext: boolean
  ) {
    if (Platform.OS !== 'android') return;
    await this.init();

    const actions = [];
    
    if (hasPrev) {
      actions.push({
        title: '⏮ Prev',
        pressAction: { id: 'media_prev' },
      });
    }

    actions.push({
      title: isPlaying ? '⏸ Pause' : '▶ Play',
      pressAction: { id: isPlaying ? 'media_pause' : 'media_play' },
    });

    if (hasNext) {
      actions.push({
        title: 'Next ⏭',
        pressAction: { id: 'media_next' },
      });
    }

    await notifee.displayNotification({
      id: 'media_player',
      title: track.title || 'Unknown Title',
      body: track.artist || 'Unknown Artist',
      android: {
        channelId: this.channelId,
        ongoing: isPlaying,
        autoCancel: false,
        smallIcon: 'ic_launcher',
        largeIcon: track.coverUrl,
        actions: actions,
        // Using a standard notification with actions since Media Style requires
        // specific local drawables that we do not have configured in Expo.
      },
    });
  }

  async clearNotification() {
    if (Platform.OS !== 'android') return;
    await notifee.cancelNotification('media_player');
  }
}

export const MediaNotificationService = new MediaNotificationServiceImpl();
