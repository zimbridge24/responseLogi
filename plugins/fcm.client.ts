import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { initializeApp } from 'firebase/app'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  
  // Firebase 설정 (환경 변수가 없을 때 기본값 사용)
  const firebaseConfig = {
    apiKey: config.public.FIREBASE_API_KEY || "demo-api-key",
    authDomain: config.public.FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
    projectId: config.public.FIREBASE_PROJECT_ID || "demo-project",
    storageBucket: config.public.FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
    messagingSenderId: config.public.FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: config.public.FIREBASE_APP_ID || "1:123456789:web:demo"
  }

  // Firebase 앱 초기화
  const app = initializeApp(firebaseConfig)
  
  // 서비스 워커 등록
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      console.log('✅ 서비스 워커 등록 성공:', registration.scope)
    } catch (error) {
      console.error('❌ 서비스 워커 등록 실패:', error)
    }
  }
  
  // FCM 초기화
  const messaging = getMessaging(app)

  // 브라우저 알림 권한 요청
  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        console.log('알림 권한이 허용되었습니다.')
        return true
      } else {
        console.log('알림 권한이 거부되었습니다.')
        return false
      }
    } catch (error) {
      console.error('알림 권한 요청 실패:', error)
      return false
    }
  }

  // FCM 토큰 발급 및 저장
  const getFCMToken = async () => {
    try {
      console.log('=== FCM 토큰 발급 시작 ===')
      const permission = await requestPermission()
      console.log('알림 권한 상태:', permission)
      
      if (!permission) {
        console.log('알림 권한이 거부되었습니다.')
        return null
      }

      const vapidKey = config.public.FCM_VAPID_KEY || "BNQtR61qKjsE_43bqyg6g4Uoz7lYuwEZNFafwFHBRRrnbS0QUXt9K6SOXo7Wk1ctw5TYdbib8Uag3gcMxbLoKic"
      console.log('VAPID 키 사용:', vapidKey.substring(0, 20) + '...')
      
      const token = await getToken(messaging, { vapidKey })
      console.log('FCM 토큰 발급 결과:', token ? '성공' : '실패')
      
      if (token) {
        console.log('FCM 토큰:', token.substring(0, 50) + '...')
        
        // Firestore에 토큰 저장
        const { $db } = useNuxtApp()
        const user = useUserStore()
        
        console.log('현재 사용자 ID:', user.currentUser?.uid)
        
        if (user.currentUser?.uid) {
          const { doc, setDoc } = await import('firebase/firestore')
          const userDocRef = doc($db, 'users', user.currentUser.uid)
          
          console.log('🔍 사용자 문서 경로:', userDocRef.path)
          console.log('🔍 저장할 토큰:', token.substring(0, 50) + '...')
          
          await setDoc(userDocRef, {
            fcmToken: token,
            updatedAt: new Date()
          }, { merge: true })
          
          console.log('✅ FCM 토큰이 Firestore에 저장되었습니다.')
          
          // 저장 확인을 위해 다시 읽어보기
          const { getDoc } = await import('firebase/firestore')
          const savedDoc = await getDoc(userDocRef)
          const savedData = savedDoc.data()
          console.log('🔍 저장된 데이터 확인:', {
            fcmToken: savedData?.fcmToken ? '있음' : '없음',
            updatedAt: savedData?.updatedAt
          })
        } else {
          console.log('❌ 사용자 ID가 없어서 토큰을 저장할 수 없습니다.')
        }
        
        return token
      } else {
        console.log('❌ FCM 토큰을 발급받을 수 없습니다.')
        return null
      }
    } catch (error) {
      console.error('❌ FCM 토큰 발급 실패:', error)
      return null
    }
  }

  // 포그라운드 메시지 수신 처리
  onMessage(messaging, (payload) => {
    console.log('🔔 포그라운드 메시지 수신:', payload)
    console.log('알림 제목:', payload.notification?.title)
    console.log('알림 내용:', payload.notification?.body)
    console.log('데이터:', payload.data)
    
    // 브라우저 알림 표시
    if (payload.notification) {
      console.log('브라우저 알림 생성 중...')
      const notification = new Notification(payload.notification.title || '알림', {
        body: payload.notification.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: payload.data?.chatId || 'default',
        requireInteraction: true
      })

      notification.onclick = () => {
        console.log('알림 클릭됨')
        window.focus()
        notification.close()
        
        // 클릭 시 해당 페이지로 이동
        if (payload.data?.click_action) {
          console.log('페이지 이동:', payload.data.click_action)
          window.location.href = payload.data.click_action
        }
      }
      
      console.log('✅ 브라우저 알림이 표시되었습니다.')
    } else {
      console.log('❌ 알림 데이터가 없습니다.')
    }
  })

  // 테스트용 푸시 알림 함수
  const testNotification = () => {
    if ('Notification' in window) {
      const notification = new Notification('테스트 알림', {
        body: 'FCM이 정상적으로 작동합니다!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'test',
        requireInteraction: true
      })
      
      notification.onclick = () => {
        console.log('테스트 알림 클릭됨')
        notification.close()
      }
    }
  }

  // FCM 토큰 확인 함수
  const checkFCMToken = async () => {
    try {
      const { $db } = useNuxtApp()
      const user = useUserStore()
      
      if (user.currentUser?.uid) {
        const { doc, getDoc } = await import('firebase/firestore')
        const userDocRef = doc($db, 'users', user.currentUser.uid)
        const userDoc = await getDoc(userDocRef)
        const userData = userDoc.data()
        
        console.log('🔍 현재 사용자 FCM 토큰 상태:', {
          userId: user.currentUser.uid,
          fcmToken: userData?.fcmToken ? '있음' : '없음',
          tokenPreview: userData?.fcmToken ? userData.fcmToken.substring(0, 50) + '...' : '없음'
        })
        
        return userData?.fcmToken
      } else {
        console.log('❌ 사용자가 로그인되지 않았습니다.')
        return null
      }
    } catch (error) {
      console.error('❌ FCM 토큰 확인 실패:', error)
      return null
    }
  }

  // 수동 웹푸시 테스트 함수 (Firebase Functions 없이)
  const testWebPush = async () => {
    try {
      console.log('🧪 웹푸시 테스트 시작...')
      
      // 1. FCM 토큰 확인
      const token = await checkFCMToken()
      if (!token) {
        console.log('❌ FCM 토큰이 없습니다. 먼저 토큰을 발급받아주세요.')
        return
      }
      
      // 2. 브라우저 알림 테스트
      if ('Notification' in window) {
        const notification = new Notification('웹푸시 테스트', {
          body: 'FCM 토큰이 정상적으로 저장되었습니다!',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'webpush-test',
          requireInteraction: true
        })
        
        notification.onclick = () => {
          console.log('웹푸시 테스트 알림 클릭됨')
          notification.close()
        }
        
        console.log('✅ 브라우저 알림 테스트 완료')
      } else {
        console.log('❌ 브라우저가 알림을 지원하지 않습니다.')
      }
      
      // 3. FCM 메시지 수신 테스트 (포그라운드)
      console.log('🔔 포그라운드 메시지 수신 대기 중...')
      console.log('💡 팁: 다른 탭에서 이 페이지를 열어두고 테스트해보세요.')
      
    } catch (error) {
      console.error('❌ 웹푸시 테스트 실패:', error)
    }
  }

  // 전역으로 사용할 수 있도록 제공
  return {
    provide: {
      fcm: {
        getToken: getFCMToken,
        messaging,
        testNotification,
        checkFCMToken,
        testWebPush
      }
    }
  }
})
