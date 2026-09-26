importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCIqNwYeujJUL4StFfqxSvb_MeJcRYVXhY",
  projectId: "madni-education-trust",
  messagingSenderId: "372435663137",
  appId: "1:372435663137:web:4cb37f8ad7c53d8470e660",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Madni Education Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update.',
    icon: '/madni-logo.png',
    data: { url: payload.data?.link || '/' },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(urlToOpen));
});
