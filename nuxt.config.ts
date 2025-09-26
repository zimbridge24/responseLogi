export default defineNuxtConfig({
  ssr: false, // SPA 모드로 설정
  nitro: {
    preset: 'static'
  },
  modules: [
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    '@nuxtjs/tailwindcss',
  ],
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      FIREBASE_API_KEY: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      FCM_VAPID_KEY: process.env.NUXT_PUBLIC_FCM_VAPID_KEY,
    }
  },
  compatibilityDate: '2024-04-03',
  // PWA 설정 (FCM을 위한 서비스 워커 등록)
  pwa: {
    workbox: {
      enabled: false // FCM을 사용하므로 Workbox 비활성화
    }
  },
  // CSP 설정 (reCAPTCHA 허용)
  security: {
    headers: {
      contentSecurityPolicy: {
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://www.google.com",
          "https://www.gstatic.com",
          "https://www.recaptcha.net"
        ],
        'frame-src': [
          "'self'",
          "https://www.google.com",
          "https://www.gstatic.com",
          "https://www.recaptcha.net"
        ],
        'frame-ancestors': [
          "'self'",
          "https://www.google.com",
          "https://www.gstatic.com",
          "https://www.recaptcha.net"
        ],
        'connect-src': [
          "'self'",
          "https://www.google.com",
          "https://www.gstatic.com",
          "https://www.recaptcha.net",
          "https://firestore.googleapis.com",
          "https://identitytoolkit.googleapis.com",
          "https://securetoken.googleapis.com"
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          "https://www.google.com",
          "https://www.gstatic.com"
        ]
      }
    }
  }
})
