import { ref } from 'vue';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useFirestore } from 'vuefire';
import { useRuntimeConfig } from '#app';

export function useNotifications() {
  const config = useRuntimeConfig().public;
  const messaging = getMessaging();
  const firestore = useFirestore();

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey: config.vapidKey });
        if (token) {
          const uid = 'user-uid'; // Replace with actual user UID
          await firestore.collection('userTokens').doc(uid).set({ token });
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
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
      };

      new Notification(notificationTitle, notificationOptions);
    });
  };

  return {
    requestPermission,
    listenForMessages,
  };
}