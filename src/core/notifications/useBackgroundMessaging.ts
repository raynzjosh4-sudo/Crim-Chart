import notifee, { AndroidImportance } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

// This handler must be registered at the root of the app, outside of any React components.
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[BackgroundMessaging] Message handled in the background!', remoteMessage);

  if (remoteMessage.data) {
    const title = remoteMessage.data.title as string | undefined;
    const body = remoteMessage.data.body as string | undefined;
    const imageUrl = remoteMessage.data.imageUrl as string | undefined;

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
        largeIcon: imageUrl ? imageUrl : undefined,
        pressAction: {
          id: 'default',
        },
      },
    });
  }
});
