import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'
import { RecaptchaVerifier } from 'firebase/auth'

// 전역 변수로 Firebase 인스턴스 관리
let firebaseApp: any = null
let firebaseAuth: any = null
let firebaseDb: any = null
let firebaseFunctions: any = null
let firebaseStorage: any = null
let firebaseAnalytics: any = null

export default defineNuxtPlugin({
  name: 'firebase-init',
  parallel: true,
  setup(nuxtApp) {
    // 클라이언트에서만 실행
    if (process.server) {
      return
    }

    // 이미 초기화되었는지 확인
    if (firebaseApp) {
      console.log('Firebase already initialized globally')
      return
    }

    try {
      const config = useRuntimeConfig()

      // Firebase 설정
      const firebaseConfig = {
        apiKey: config.public.FIREBASE_API_KEY,
        authDomain: config.public.FIREBASE_AUTH_DOMAIN,
        projectId: config.public.FIREBASE_PROJECT_ID,
        storageBucket: config.public.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: config.public.FIREBASE_MESSAGING_SENDER_ID,
        appId: config.public.FIREBASE_APP_ID,
      }

      // Firebase 앱 초기화
      firebaseApp = initializeApp(firebaseConfig)
      console.log('Firebase app initialized')

      // Firebase 서비스들 초기화
      firebaseAuth = getAuth(firebaseApp)
      firebaseDb = getFirestore(firebaseApp)
      firebaseFunctions = getFunctions(firebaseApp, 'us-central1')
      firebaseStorage = getStorage(firebaseApp)

      console.log('Firebase services initialized:', {
        auth: !!firebaseAuth,
        db: !!firebaseDb,
        functions: !!firebaseFunctions,
        storage: !!firebaseStorage
      })

      // 개발 환경에서 에뮬레이터 연결
      if (process.env.NODE_ENV === 'development') {
        try {
          // Auth 에뮬레이터
          if (!firebaseAuth._delegate._config.emulator) {
            connectAuthEmulator(firebaseAuth, 'http://localhost:9099', { disableWarnings: true })
            console.log('Auth emulator connected')
          }
        } catch (error) {
          console.log('Auth emulator already connected or not available')
        }

        try {
          // Firestore 에뮬레이터
          if (!firebaseDb._delegate._databaseId.projectId.includes('demo-')) {
            connectFirestoreEmulator(firebaseDb, 'localhost', 8080)
            console.log('Firestore emulator connected')
          }
        } catch (error) {
          console.log('Firestore emulator already connected or not available')
        }

        try {
          // Functions 에뮬레이터
          connectFunctionsEmulator(firebaseFunctions, 'localhost', 5001)
          console.log('Functions emulator connected')
        } catch (error) {
          console.log('Functions emulator already connected or not available')
        }

        try {
          // Storage 에뮬레이터
          connectStorageEmulator(firebaseStorage, 'localhost', 9199)
          console.log('Storage emulator connected')
        } catch (error) {
          console.log('Storage emulator already connected or not available')
        }
      }

      // Analytics 초기화 (클라이언트에서만)
      if (process.client) {
        try {
          firebaseAnalytics = getAnalytics(firebaseApp)
          console.log('Analytics initialized')
        } catch (error) {
          console.log('Analytics not available:', error)
        }
      }

      // Nuxt 앱에 Firebase 서비스들 제공 (안전한 방법)
      try {
        if (!nuxtApp.$firebase) {
          nuxtApp.$firebase = firebaseApp
        }
        if (!nuxtApp.$auth) {
          nuxtApp.$auth = firebaseAuth
        }
        if (!nuxtApp.$db) {
          nuxtApp.$db = firebaseDb
        }
        if (!nuxtApp.$functions) {
          nuxtApp.$functions = firebaseFunctions
        }
        if (!nuxtApp.$storage) {
          nuxtApp.$storage = firebaseStorage
        }
        if (!nuxtApp.$analytics) {
          nuxtApp.$analytics = firebaseAnalytics
        }
        if (!nuxtApp.$RecaptchaVerifier) {
          nuxtApp.$RecaptchaVerifier = RecaptchaVerifier
        }
        
        console.log('Firebase services provided to Nuxt app')
      } catch (error) {
        console.error('Error providing Firebase services:', error)
      }

    } catch (error) {
      console.error('Firebase initialization error:', error)
    }
  }
})