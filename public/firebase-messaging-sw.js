importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBlaGIqUR4PL5tIbMCiKJjMp_T92jN4eTo",
  authDomain: "node-624df.firebaseapp.com",
  projectId: "node-624df",
  storageBucket: "node-624df.firebasestorage.app",
  messagingSenderId: "959127069942",
  appId: "1:959127069942:web:84b93ca8f97ef32e3838d7",
  measurementId: "G-4KYT7W9VNW"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
