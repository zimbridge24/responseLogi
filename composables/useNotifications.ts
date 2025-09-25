import { ref } from 'vue';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

export function useNotifications() {
  const config = useRuntimeConfig().public;
  const messaging = getMessaging();
  
  // Firebase Firestore 인스턴스 가져오기
  const getFirestore = () => {
    if (typeof window !== 'undefined') {
      const { $db } = useNuxtApp();
      return $db;
    }
    return null;
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey: config.FCM_VAPID_KEY });
        if (token) {
          const firestore = getFirestore();
          if (firestore) {
            const uid = 'user-uid'; // Replace with actual user UID
            const { doc, setDoc } = await import('firebase/firestore');
            await setDoc(doc(firestore, 'userTokens', uid), { token });
          }
        }
      }
    } catch (error) {
      console.error('Error getting notification permission or token:', error);
    }
  };

  const listenForMessages = () => {
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      // Customize notification handling here
      if (payload.notification) {
        const notificationTitle = payload.notification.title || 'New Message';
        const notificationOptions = {
          body: payload.notification.body || '',
          icon: payload.notification.icon || '/icon-192x192.png',
        };

        new Notification(notificationTitle, notificationOptions);
      }
    });
  };

  return {
    requestPermission,
    listenForMessages,
  };
}