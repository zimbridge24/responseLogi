<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">간단한 Firebase 테스트</h1>
    
    <div class="bg-gray-100 p-4 rounded mb-4">
      <h2 class="text-lg font-semibold mb-2">테스트 정보</h2>
      <p>이메일: test@example.com</p>
      <p>비밀번호: password123</p>
    </div>
    
    <button 
      @click="testRegistration" 
      :disabled="loading"
      class="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
    >
      {{ loading ? '테스트 중...' : '회원가입 테스트' }}
    </button>
    
    <div v-if="result" class="mt-4 p-4 bg-green-100 text-green-800 rounded">
      {{ result }}
    </div>
    
    <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-800 rounded">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)
const result = ref('')
const error = ref('')

const testRegistration = async () => {
  loading.value = true
  result.value = ''
  error.value = ''
  
  try {
    console.log('=== Firebase 테스트 시작 ===')
    
    // Firebase 직접 초기화
    const { initializeApp, getApps } = await import('firebase/app')
    const { getAuth, createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
    const { getFirestore, doc, setDoc } = await import('firebase/firestore')
    
    const config = useRuntimeConfig().public
    
    const firebaseConfig = {
      apiKey: config.FIREBASE_API_KEY,
      authDomain: config.FIREBASE_AUTH_DOMAIN,
      projectId: config.FIREBASE_PROJECT_ID,
      storageBucket: config.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
      appId: config.FIREBASE_APP_ID,
    }
    
    console.log('Firebase 설정:', firebaseConfig)
    
    // Firebase 앱 초기화
    let app
    if (getApps().length === 0) {
      console.log('새 Firebase 앱 초기화')
      app = initializeApp(firebaseConfig)
    } else {
      console.log('기존 Firebase 앱 사용')
      app = getApps()[0]
    }
    
    const auth = getAuth(app)
    const db = getFirestore(app)
    
    console.log('Firebase 서비스:', { auth: !!auth, db: !!db })
    
    // 테스트 이메일 생성 (중복 방지)
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'password123'
    const testName = 'Test User'
    
    console.log('사용자 생성 시도:', testEmail)
    
    // 1. Firebase Auth에 사용자 생성
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword)
    const user = userCredential.user
    
    console.log('사용자 생성 성공:', user.uid)
    
    // 2. 사용자 프로필 업데이트
    await updateProfile(user, {
      displayName: testName
    })
    
    console.log('프로필 업데이트 완료')
    
    // 3. Firestore에 사용자 정보 저장
    const userData = {
      name: testName,
      email: testEmail,
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    console.log('Firestore 저장 시도:', userData)
    await setDoc(doc(db, 'users', user.uid), userData)
    
    console.log('Firestore 저장 성공!')
    
    result.value = `✅ 성공! 사용자 ID: ${user.uid}`
    
  } catch (err: any) {
    console.error('테스트 실패:', err)
    error.value = `❌ 실패: ${err.message}`
  } finally {
    loading.value = false
  }
}
</script>





