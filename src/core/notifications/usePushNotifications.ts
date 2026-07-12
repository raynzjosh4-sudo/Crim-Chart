import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { FIREBASE_VAPID_KEY, firebaseConfig } from './firebaseConfig';
// Native push notification modules will be required conditionally

// Expo handles incoming notifications while the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | any | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const fcmUnsubscribe = useRef<() => void>();
  const { user } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    async function setupNotifications() {
      let token: string | null = null;

      if (Platform.OS === 'web') {
        try {
          if (typeof window !== 'undefined' && 'Notification' in window) {
            const permission = await window.Notification.requestPermission();
            if (permission === 'granted') {
              const app = initializeApp(firebaseConfig);
              const messaging = getMessaging(app);
              
              if ('serviceWorker' in navigator) {
                try {
                  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                  token = await getToken(messaging, { 
                    vapidKey: FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: registration
                  });
                  console.log('[PushNotifications] Web FCM Token retrieved:', token);
                } catch (swError) {
                  console.log('[PushNotifications] Service worker registration failed or is blocked. Push notifications will be disabled for Web.', swError);
                }
              }

              const unsubscribe = onMessage(messaging, (payload) => {
                console.log('[PushNotifications] Web foreground message received:', payload);
                if (payload.notification) {
                  new window.Notification(payload.notification.title || 'Crimchart', {
                    body: payload.notification.body,
                    icon: payload.notification.image || '/favicon.ico',
                  });
                }
              });
              fcmUnsubscribe.current = unsubscribe;
            } else {
              console.log('[PushNotifications] Web push permission denied');
            }
          }
        } catch (e) {
          console.error('[PushNotifications] Error setting up Web FCM:', e);
        }
      } else {
        token = await registerForPushNotificationsAsync();
        
        // Listen for foreground Native FCM messages
        const notifeeModule = require('@notifee/react-native');
        const notifee = notifeeModule.default || notifeeModule;
        const { AndroidImportance, AndroidStyle } = notifeeModule;
        const rnMessagingModule = require('@react-native-firebase/messaging');
        const rnMessaging = rnMessagingModule.default || rnMessagingModule;

        const unsubscribe = rnMessaging().onMessage(async (remoteMessage: any) => {
          console.log('[PushNotifications] Native foreground message received:', remoteMessage);
          
          if (remoteMessage.data) {
            const title = remoteMessage.data.title as string | undefined;
            const body = remoteMessage.data.body as string | undefined;
            const imageUrl = remoteMessage.data.imageUrl as string | undefined;
            const postImageUrl = remoteMessage.data.postImageUrl as string | undefined;
            
            const channelId = await notifee.createChannel({
              id: 'default',
              name: 'Default Channel',
              importance: AndroidImportance.HIGH,
            });
            
            await notifee.displayNotification({
              title: title || 'Crimchart',
              body: body || 'You have a new notification',
              android: {
                channelId,
                largeIcon: imageUrl || undefined,
                circularLargeIcon: !!imageUrl,
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
        fcmUnsubscribe.current = unsubscribe;
      }

      if (token && isMounted) {
        setExpoPushToken(token);
        // Save the token to Supabase if a user is logged in
        if (user?.id) {
          try {
            const { error } = await supabase
              .from('user_push_tokens')
              .upsert({
                user_id: user.id,
                token: token,
                platform: Platform.OS,
              }, { onConflict: 'user_id,token', ignoreDuplicates: true });
            
            if (error) {
              console.error('[PushNotifications] Error saving token:', error);
            } else {
              console.log('[PushNotifications] Successfully registered token for user.');
            }
          } catch (e) {
            console.error('[PushNotifications] Exception saving token:', e);
          }
        }
      }
    }

    setupNotifications();

    // Listeners for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notif => {
      setNotification(notif);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[PushNotifications] User tapped notification:', response);
      // Here you can navigate the user to a specific screen based on response.notification.request.content.data
    });

    return () => {
      isMounted = false;
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      if (fcmUnsubscribe.current) {
        fcmUnsubscribe.current();
      }
    };
  }, [user?.id]);

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    let permissions: any = await Notifications.getPermissionsAsync();
    let isGranted = permissions.granted || permissions.status === 'granted';
    if (!isGranted) {
      permissions = await Notifications.requestPermissionsAsync();
      isGranted = permissions.granted || permissions.status === 'granted';
    }
    if (!isGranted) {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      // By using getDevicePushTokenAsync instead of getExpoPushTokenAsync,
      // we completely bypass Expo's servers and get the raw Google FCM token!
      token = (await Notifications.getDevicePushTokenAsync()).data;
      console.log('[PushNotifications] Raw FCM Token retrieved:', token);
    } catch (e) {
      console.log('[PushNotifications] Error getting raw device push token:', e);
    }
  } else {
    console.log('[PushNotifications] Must use physical device for Push Notifications');
  }

  return token;
}
