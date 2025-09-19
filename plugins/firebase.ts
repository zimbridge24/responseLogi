import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

export default defineNuxtPlugin((nuxtApp) => {
  // 이미 Firebase가 초기화되었는지 확인
  if (nuxtApp.$firebase) {
    console.log('Firebase already initialized')
    return
  }

  try {
    const config = useRuntimeConfig().public

    console.log('Firebase config:', {
      apiKey: config.FIREBASE_API_KEY ? '✅' : '❌',
      authDomain: config.FIREBASE_AUTH_DOMAIN ? '✅' : '❌',
      projectId: config.FIREBASE_PROJECT_ID ? '✅' : '❌',
      storageBucket: config.FIREBASE_STORAGE_BUCKET ? '✅' : '❌',
      messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID ? '✅' : '❌',
      appId: config.FIREBASE_APP_ID ? '✅' : '❌',
    })

    // Firebase 설정값 검증
    if (!config.FIREBASE_API_KEY || !config.FIREBASE_PROJECT_ID) {
      console.error('Firebase configuration is incomplete:', config)
      return
    }

    // Firebase가 이미 초기화되었는지 확인
    let app
    if (getApps().length === 0) {
      const firebaseConfig = {
        apiKey: config.FIREBASE_API_KEY,
        authDomain: config.FIREBASE_AUTH_DOMAIN,
        projectId: config.FIREBASE_PROJECT_ID,
        storageBucket: config.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
        appId: config.FIREBASE_APP_ID,
      }

      console.log('Initializing Firebase with config:', firebaseConfig)
      app = initializeApp(firebaseConfig)
      console.log('Firebase app initialized:', app)
    } else {
      app = getApps()[0]
      console.log('Using existing Firebase app:', app)
    }

    const auth = getAuth(app)
    const db = getFirestore(app)
    const functions = getFunctions(app)

    console.log('Firebase services initialized:', {
      auth: !!auth,
      db: !!db,
      functions: !!functions
    })

    return {
      provide: {
        firebase: app,
        auth,
        db,
        functions,
      },
    }
  } catch (error) {
    console.error('Firebase initialization error:', error)
    return
  }
})