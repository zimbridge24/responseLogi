<template>
  <div class="min-h-screen gradient-bg-green flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-white mb-2">
          파트너 로그인
        </h2>
        <p class="text-green-100">
          계정이 없으신가요?
          <NuxtLink to="/partner/register" class="font-semibold text-white hover:text-green-100 transition-colors underline">
            회원가입하기
          </NuxtLink>
        </p>
      </div>

      <!-- Form -->
      <div class="card">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Phone Number -->
          <div>
            <label for="phone" class="form-label">전화번호</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              required
              class="form-input"
              placeholder="01012345678"
              @input="formatPhoneNumber"
              maxlength="11"
            />
            <p class="text-xs text-gray-500 mt-1">010으로 시작하는 11자리 숫자만 입력하세요</p>
          </div>

          <!-- Verification Code (shown after sending) -->
          <div v-if="verificationSent">
            <label for="verificationCode" class="form-label">인증번호</label>
            <input
              id="verificationCode"
              v-model="formData.verificationCode"
              type="text"
              required
              class="form-input"
              placeholder="6자리 인증번호"
              maxlength="6"
            />
          </div>

          <!-- Send Verification Button -->
          <div v-if="!verificationSent">
            <button
              type="button"
              @click="sendVerificationCode"
              :disabled="loading || !validatePhoneNumber(formData.phone) || !firebaseReady"
              class="btn-primary w-full flex justify-center items-center py-4 px-6 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="loading" class="loading-spinner -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? '인증번호 전송 중...' : '인증번호 전송' }}
            </button>
          </div>

          <!-- Verify and Login Button -->
          <div v-else>
            <button
              type="submit"
              :disabled="loading || !formData.verificationCode"
              class="btn-primary w-full flex justify-center items-center py-4 px-6 text-lg font-semibold bg-green-600 hover:bg-green-700"
            >
              <svg v-if="loading" class="loading-spinner -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? '로그인 중...' : '로그인하기' }}
            </button>
          </div>

          <!-- Firebase Loading Message -->
          <div v-if="!firebaseReady && !error" class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div class="ml-3">
                <p class="text-sm text-blue-800 font-medium">Firebase 초기화 중...</p>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="ml-3">
                <p class="text-sm text-red-800 font-medium">{{ error }}</p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- reCAPTCHA Container -->
      <div id="recaptcha-container"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth'
import { doc, getFirestore, getDoc } from 'firebase/firestore'

const nuxtApp = useNuxtApp()
const userStore = useUserStore()
const router = useRouter()

// Firebase 인스턴스들을 안전하게 가져오기
const $auth = nuxtApp.$auth
const $db = nuxtApp.$db
const $RecaptchaVerifier = nuxtApp.$RecaptchaVerifier

const formData = ref({
  phone: '',
  verificationCode: ''
})

const loading = ref(false)
const error = ref('')
const verificationSent = ref(false)
const confirmationResult = ref<any>(null)
const recaptchaVerifier = ref<any>(null)
const firebaseReady = ref(false)

const validatePhoneNumber = (phone: string) => {
  const phoneRegex = /^010\d{8}$/
  return phoneRegex.test(phone)
}

const formatPhoneNumber = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '')
  
  // 010 자동 추가 로직 제거 - 사용자가 직접 입력하도록 함
  
  if (value.length > 11) {
    value = value.substring(0, 11)
  }
  
  formData.value.phone = value
  target.value = value
}

// reCAPTCHA 초기화 (완전 정리 후 재생성)
const initializeRecaptcha = async () => {
  if (!process.client) return null

  const authInstance = nuxtApp.$auth || $auth
  const RecaptchaVerifierClass = nuxtApp.$RecaptchaVerifier || $RecaptchaVerifier
  
  if (!authInstance) {
    throw new Error('Firebase auth not initialized')
  }
  
  if (!RecaptchaVerifierClass) {
    throw new Error('reCAPTCHA verifier not available')
  }

  // 기존 reCAPTCHA 완전 정리
  if (recaptchaVerifier.value) {
    try {
      recaptchaVerifier.value.clear()
    } catch (e) {
      console.warn('reCAPTCHA clear failed:', e)
    }
    recaptchaVerifier.value = null
  }

  // 기존 컨테이너 제거
  const existingContainer = document.getElementById('recaptcha-container')
  if (existingContainer) {
    existingContainer.remove()
  }

  // 새로운 컨테이너 생성
  const container = document.createElement('div')
  container.id = 'recaptcha-container'
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '1px'
  container.style.height = '1px'
  container.style.overflow = 'hidden'
  document.body.appendChild(container)

  // 잠시 대기 후 reCAPTCHA 생성
  await new Promise(resolve => setTimeout(resolve, 100))

  try {
    recaptchaVerifier.value = new RecaptchaVerifierClass(authInstance, container, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved')
      }
    })

    await recaptchaVerifier.value.render()
    console.log('reCAPTCHA initialized successfully')
    
    return recaptchaVerifier.value
  } catch (error) {
    console.error('reCAPTCHA initialization failed:', error)
    // 실패 시 컨테이너 정리
    try {
      container.remove()
    } catch (e) {}
    throw error
  }
}

const sendVerificationCode = async () => {
  if (!validatePhoneNumber(formData.value.phone)) {
    error.value = '올바른 전화번호 형식을 입력해주세요. (01012345678)'
    return
  }

  if (!firebaseReady.value) {
    error.value = 'Firebase가 아직 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    
    const authInstance = nuxtApp.$auth || $auth
    const dbInstance = nuxtApp.$db || $db
    const recaptchaVerifier = nuxtApp.$RecaptchaVerifier || $RecaptchaVerifier
    
    if (!authInstance || !dbInstance || !recaptchaVerifier) {
      throw new Error('Firebase services not properly initialized')
    }
    
    const verifier = await initializeRecaptcha()

    const phoneNumber = '+82' + formData.value.phone.substring(1)
    
    console.log('인증번호 전송 시도:', phoneNumber)
    confirmationResult.value = await signInWithPhoneNumber(authInstance, phoneNumber, verifier)
    
    verificationSent.value = true
    console.log('인증번호 전송 성공')
  } catch (err: any) {
    console.error('인증번호 전송 실패:', err)
    if (err.code === 'auth/invalid-phone-number') {
      error.value = '유효하지 않은 전화번호입니다.'
    } else if (err.code === 'auth/too-many-requests') {
      error.value = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    } else if (err.code === 'auth/invalid-app-credential') {
      error.value = 'Firebase 설정에 문제가 있습니다. 관리자에게 문의하세요.'
    } else {
      error.value = '인증번호 전송에 실패했습니다. 다시 시도해주세요.'
    }
  } finally {
    loading.value = false
  }
}

const verifyCode = async () => {
  if (!formData.value.verificationCode) {
    error.value = '인증번호를 입력해주세요.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    if (!confirmationResult.value) {
      throw new Error('인증번호 전송이 필요합니다.')
    }

    const credential = PhoneAuthProvider.credential(
      confirmationResult.value.verificationId,
      formData.value.verificationCode
    )

    const authInstance = nuxtApp.$auth || $auth
    const dbInstance = nuxtApp.$db || $db
    
    if (!authInstance || !dbInstance) {
      throw new Error('Firebase services not properly initialized')
    }
    
    const result = await signInWithCredential(authInstance, credential)
    console.log('인증 성공:', result.user)

    // Firestore에서 사용자 정보 확인
    const userDoc = await getDoc(doc(dbInstance, 'users', result.user.uid))
    
    if (userDoc.exists()) {
      const userData = userDoc.data()
      
      // 파트너 역할인지 확인
      if (userData.role !== 'partner') {
        await authInstance.signOut()
        error.value = '파트너 계정이 아닙니다. 고객 로그인을 이용해주세요.'
        return
      }

      // 사용자 정보를 스토어에 저장
      await userStore.setUser(result.user, userData)
      
      console.log('파트너 로그인 성공')
      
      // 승인 상태에 따른 리다이렉트
      if (userData.approvalStatus === 'pending') {
        router.push('/partner/pending')
      } else if (userData.approvalStatus === 'rejected') {
        router.push('/partner/rejected')
      } else if (userData.approvalStatus === 'approved') {
        router.push('/partner')
      } else {
        router.push('/partner')
      }
    } else {
      // 등록되지 않은 계정인 경우
      await authInstance.signOut()
      
      // 확인 메시지 표시
      const shouldRegister = confirm('가입하지 않은 이용자입니다. 회원가입 페이지로 가시겠습니까?')
      
      if (shouldRegister) {
        // 파트너 회원가입 페이지로 이동
        await router.push('/partner/register')
      } else {
        // 기존 페이지에서 전화번호를 다시 입력하도록 폼 초기화
        formData.value.phone = ''
        formData.value.verificationCode = ''
        verificationSent.value = false
        error.value = '다시 전화번호를 입력해주세요.'
      }
    }
  } catch (err: any) {
    console.error('인증 실패:', err)
    if (err.code === 'auth/invalid-verification-code') {
      error.value = '잘못된 인증번호입니다.'
    } else if (err.code === 'auth/code-expired') {
      error.value = '인증번호가 만료되었습니다. 다시 전송해주세요.'
    } else {
      error.value = '인증에 실패했습니다. 다시 시도해주세요.'
    }
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!verificationSent.value) {
    await sendVerificationCode()
  } else {
    await verifyCode()
  }
}

// Firebase 초기화 확인
onMounted(async () => {
  console.log('Login page mounted, checking Firebase initialization...')
  
  // Firebase 초기화 대기 (최대 5초)
  let attempts = 0
  const maxAttempts = 50 // 5초 (100ms * 50)
  
  while (attempts < maxAttempts && !firebaseReady.value) {
    const authInstance = nuxtApp.$auth
    const dbInstance = nuxtApp.$db
    const recaptchaVerifier = nuxtApp.$RecaptchaVerifier
    
    if (authInstance && dbInstance && recaptchaVerifier) {
      firebaseReady.value = true
      console.log('Firebase services ready:', {
        auth: !!authInstance,
        db: !!dbInstance,
        recaptcha: !!recaptchaVerifier
      })
      break
    }
    
    console.log(`Firebase not ready yet, attempt ${attempts + 1}/${maxAttempts}`)
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }
  
  if (!firebaseReady.value) {
    console.error('Firebase initialization timeout')
    error.value = 'Firebase 초기화에 실패했습니다. 페이지를 새로고침해주세요.'
  }
})

// 컴포넌트 언마운트 시 reCAPTCHA 정리
onUnmounted(() => {
  // reCAPTCHA 인스턴스 정리
  if (recaptchaVerifier.value) {
    try {
      recaptchaVerifier.value.clear()
      console.log('reCAPTCHA cleared on unmount')
    } catch (error) {
      console.warn('reCAPTCHA 정리 중 오류:', error)
    }
    recaptchaVerifier.value = null
  }
  
  // reCAPTCHA 컨테이너 완전 제거
  const container = document.getElementById('recaptcha-container')
  if (container) {
    try {
      container.remove()
      console.log('reCAPTCHA container removed')
    } catch (error) {
      console.warn('컨테이너 제거 중 오류:', error)
    }
  }
})
</script>
