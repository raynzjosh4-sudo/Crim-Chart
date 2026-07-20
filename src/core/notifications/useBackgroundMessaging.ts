import notifee, { AndroidImportance, AndroidStyle, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { useGlobalAudioPlayer } from '@/core/store/useGlobalAudioPlayer';
import { useDesktopNowPlayingStore } from '@/core/store/useDesktopNowPlayingStore';

// This handler must be registered at the root of the app, outside of any React components.
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[BackgroundMessaging] Message handled in the background!', remoteMessage);

  if (remoteMessage.data) {
    const title = remoteMessage.data.title as string | undefined;
    const body = remoteMessage.data.body as string | undefined;
    const imageUrl = remoteMessage.data.imageUrl as string | undefined;
    const postImageUrl = remoteMessage.data.postImageUrl as string | undefined;

    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    // Display a notification
    await notifee.displayNotification({
      title: title || 'Crimchart',
      body: body || 'You have a new notification',
      android: {
        channelId,
        largeIcon: imageUrl || undefined, // Big round user image
        circularLargeIcon: !!imageUrl,    // Make it round
        style: postImageUrl ? {
          type: AndroidStyle.BIGPICTURE,
          picture: postImageUrl,
        } : undefined,
        pressAction: {
          id: 'default',
        },
      },
    });
  }
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.ACTION_PRESS && detail.pressAction) {
    if (detail.pressAction.id === 'media_play') {
      await useGlobalAudioPlayer.getState().resumeCurrent();
    } else if (detail.pressAction.id === 'media_pause') {
      await useGlobalAudioPlayer.getState().pauseCurrent();
    } else if (detail.pressAction.id === 'media_next') {
      useDesktopNowPlayingStore.getState().nextTrack();
    } else if (detail.pressAction.id === 'media_prev') {
      useDesktopNowPlayingStore.getState().prevTrack();
    }
  }
});
