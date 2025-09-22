<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Firebase Direct Test</h1>
    
    <div class="space-y-4">
      <button 
        @click="testDirectFirebase" 
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        :disabled="loading"
      >
        {{ loading ? 'Testing...' : 'Test Direct Firebase' }}
      </button>
      
      <div v-if="result" class="p-4 bg-green-100 rounded">
        <h3 class="font-semibold">Result:</h3>
        <pre>{{ result }}</pre>
      </div>
      
      <div v-if="error" class="p-4 bg-red-100 rounded">
        <h3 class="font-semibold">Error:</h3>
        <pre>{{ error }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)
const result = ref('')
const error = ref('')

const testDirectFirebase = async () => {
  loading.value = true
  result.value = ''
  error.value = ''
  
  try {
    // Firebase 직접 초기화
    const { initializeApp, getApps } = await import('firebase/app')
    const { getAuth } = await import('firebase/auth')
    const { getFirestore } = await import('firebase/firestore')
    const { createUserWithEmailAndPassword } = await import('firebase/auth')
    const { doc, setDoc } = await import('firebase/firestore')
    
    const config = useRuntimeConfig().public
    
    const firebaseConfig = {
      apiKey: config.FIREBASE_API_KEY,
      authDomain: config.FIREBASE_AUTH_DOMAIN,
      projectId: config.FIREBASE_PROJECT_ID,
      storageBucket: config.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
      appId: config.FIREBASE_APP_ID,
    }
    
    console.log('Direct Firebase config:', firebaseConfig)
    
    let app
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }
    
    const auth = getAuth(app)
    const db = getFirestore(app)
    
    console.log('Direct Firebase services:', { auth: !!auth, db: !!db })
    
    // 테스트 사용자 생성
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = '123456'
    
    console.log('Creating test user:', testEmail)
    
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword)
    const user = userCredential.user
    
    console.log('User created:', user.uid)
    
    // Firestore에 데이터 저장
    const userData = {
      name: 'Test User',
      email: testEmail,
      role: 'customer',
      createdAt: new Date(),
    }
    
    console.log('Saving to Firestore...')
    await setDoc(doc(db, 'users', user.uid), userData)
    console.log('✅ Data saved to Firestore!')
    
    result.value = `Success! User created: ${user.uid}\nData saved to Firestore: users/${user.uid}`
    
  } catch (err: any) {
    console.error('Direct Firebase test error:', err)
    error.value = `Error: ${err.message}\nCode: ${err.code}`
  } finally {
    loading.value = false
  }
}
</script>





