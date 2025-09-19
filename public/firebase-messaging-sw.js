// Firebase 서비스 워커 설정
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase 설정
firebase.initializeApp({
  apiKey: 'AIzaSyA9kSJoOsJshYLWNpljdDVpZXw3NmrhLz8',
  authDomain: 'responserogi.firebaseapp.com',
  projectId: 'responserogi',
  storageBucket: 'responserogi.firebasestorage.app',
  messagingSenderId: '697844763490',
  appId: '1:697844763490:web:0dc1a9e6bf51d5ac177a3b',
});

// FCM 초기화
const messaging = firebase.messaging();

// 백그라운드 메시지 수신 처리
messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.notification?.title || '알림';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: payload.data?.chatId || 'default',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: '열기'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ]
  };

  // 알림 표시
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
  console.log('알림 클릭:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // 클릭 시 해당 페이지로 이동
    const clickAction = event.notification.data?.click_action;
    if (clickAction) {
      event.waitUntil(
        clients.openWindow(clickAction)
      );
    } else {
      // 기본 페이지로 이동
      event.waitUntil(
        clients.openWindow('/')
      );
    }
  }
});

// 푸시 이벤트 처리 (FCM 외부에서 오는 푸시)
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.notification?.title || '알림';
  const options = {
    body: data.notification?.body || '새로운 알림이 있습니다.',
    icon: data.notification?.icon || '/icon-192x192.png',
    badge: data.notification?.badge || '/badge-72x72.png',
    tag: data.data?.chatId || 'default',
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});