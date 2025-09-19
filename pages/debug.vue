<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Firebase Debug</h1>
    
    <div class="space-y-4">
      <div>
        <h2 class="text-lg font-semibold">Firebase Config:</h2>
        <pre class="bg-gray-100 p-4 rounded">{{ JSON.stringify(firebaseConfig, null, 2) }}</pre>
      </div>
      
      <div>
        <h2 class="text-lg font-semibold">Firebase Services:</h2>
        <ul class="list-disc list-inside">
          <li>Firebase App: {{ firebaseApp ? '✅' : '❌' }}</li>
          <li>Auth: {{ auth ? '✅' : '❌' }}</li>
          <li>Firestore: {{ db ? '✅' : '❌' }}</li>
        </ul>
      </div>
      
      <div>
        <h2 class="text-lg font-semibold">Test Firebase Auth:</h2>
        <button 
          @click="testAuth" 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          :disabled="loading"
        >
          {{ loading ? 'Testing...' : 'Test Auth' }}
        </button>
        <div v-if="authResult" class="mt-2 p-2 bg-green-100 rounded">
          {{ authResult }}
        </div>
        <div v-if="authError" class="mt-2 p-2 bg-red-100 rounded">
          {{ authError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $firebase, $auth, $db } = useNuxtApp()
const config = useRuntimeConfig().public

const firebaseConfig = {
  apiKey: config.FIREBASE_API_KEY,
  authDomain: config.FIREBASE_AUTH_DOMAIN,
  projectId: config.FIREBASE_PROJECT_ID,
  storageBucket: config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
  appId: config.FIREBASE_APP_ID,
}

const firebaseApp = $firebase
const auth = $auth
const db = $db

const loading = ref(false)
const authResult = ref('')
const authError = ref('')

const testAuth = async () => {
  loading.value = true
  authResult.value = ''
  authError.value = ''
  
  try {
    if (!$auth) {
      throw new Error('Auth service not available')
    }
    
    const { signInAnonymously } = await import('firebase/auth')
    await signInAnonymously($auth)
    authResult.value = 'Auth test successful!'
  } catch (error: any) {
    authError.value = `Auth test failed: ${error.message}`
  } finally {
    loading.value = false
  }
}
</script>




