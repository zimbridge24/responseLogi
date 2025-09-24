import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, RecaptchaVerifier } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getStorage } from 'firebase/storage'

export default defineNuxtPlugin((nuxtApp) => {
  // 이미 Firebase가 초기화되었는지 확인
  if (nuxtApp.$firebase) {
    console.log('Firebase already initialized')
    return
  }

  try {
    const config = useRuntimeConfig().public

    console.log('Firebase config check:', {
      apiKey: config.FIREBASE_API_KEY ? '✅' : '❌',
      authDomain: config.FIREBASE_AUTH_DOMAIN ? '✅' : '❌',
      projectId: config.FIREBASE_PROJECT_ID ? '✅' : '❌',
      storageBucket: config.FIREBASE_STORAGE_BUCKET ? '✅' : '❌',
      messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID ? '✅' : '❌',
      appId: config.FIREBASE_APP_ID ? '✅' : '❌',
    })

    console.log('Full config object:', config)

    // 환경 변수 직접 확인
    console.log('Direct env check:', {
      NUXT_PUBLIC_FIREBASE_API_KEY: process.env.NUXT_PUBLIC_FIREBASE_API_KEY ? '✅' : '❌',
      NUXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅' : '❌',
    })

    // Firebase 설정값 검증 - 환경 변수 직접 사용
    const apiKey = config.FIREBASE_API_KEY || process.env.NUXT_PUBLIC_FIREBASE_API_KEY
    const projectId = config.FIREBASE_PROJECT_ID || process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID
    const authDomain = config.FIREBASE_AUTH_DOMAIN || process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    const storageBucket = config.FIREBASE_STORAGE_BUCKET || process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    const messagingSenderId = config.FIREBASE_MESSAGING_SENDER_ID || process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    const appId = config.FIREBASE_APP_ID || process.env.NUXT_PUBLIC_FIREBASE_APP_ID

    if (!apiKey || !projectId) {
      console.error('Firebase configuration is incomplete:', {
        apiKey: !!apiKey,
        projectId: !!projectId,
        authDomain: !!authDomain,
        storageBucket: !!storageBucket,
        messagingSenderId: !!messagingSenderId,
        appId: !!appId
      })
      return
    }

    // Firebase가 이미 초기화되었는지 확인
    let app
    if (getApps().length === 0) {
      const firebaseConfig = {
        apiKey: apiKey,
        authDomain: authDomain,
        projectId: projectId,
        storageBucket: storageBucket,
        messagingSenderId: messagingSenderId,
        appId: appId,
      }

    console.log('Initializing Firebase with config:', {
      apiKey: apiKey ? '✅' : '❌',
      authDomain: authDomain ? '✅' : '❌',
      projectId: projectId ? '✅' : '❌',
      storageBucket: storageBucket ? '✅' : '❌',
      messagingSenderId: messagingSenderId ? '✅' : '❌',
      appId: appId ? '✅' : '❌',
    })
    app = initializeApp(firebaseConfig)
    console.log('Firebase app initialized:', app)
    } else {
      app = getApps()[0]
      console.log('Using existing Firebase app:', app)
    }

    const auth = getAuth(app)
    const db = getFirestore(app)
    const functions = getFunctions(app)
    const storage = getStorage(app)

    console.log('Firebase services initialized:', {
      auth: !!auth,
      db: !!db,
      functions: !!functions,
      storage: !!storage
    })

    return {
      provide: {
        firebase: app,
        auth,
        db,
        functions,
        storage,
        RecaptchaVerifier,
      },
    }
  } catch (error) {
    console.error('Firebase initialization error:', error)
    return
  }
})