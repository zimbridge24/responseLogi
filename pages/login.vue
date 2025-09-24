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
              :disabled="loading || !validatePhoneNumber(formData.phone)"
              class="btn-primary w-full flex justify-center items-center py-4 px-6 text-lg font-semibold bg-green-600 hover:bg-green-700"
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
import { ref } from 'vue'
import { signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth'
import { doc, getFirestore, getDoc } from 'firebase/firestore'

const { $auth, $db, $RecaptchaVerifier } = useNuxtApp()
const userStore = useUserStore()
const router = useRouter()

const formData = ref({
  phone: '',
  verificationCode: ''
})

const loading = ref(false)
const error = ref('')
const verificationSent = ref(false)
const confirmationResult = ref<any>(null)
const recaptchaVerifier = ref<any>(null)

const validatePhoneNumber = (phone: string) => {
  const phoneRegex = /^010\d{8}$/
  return phoneRegex.test(phone)
}

const formatPhoneNumber = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '')
  
  if (value.length > 0 && !value.startsWith('010')) {
    value = '010' + value
  }
  
  if (value.length > 11) {
    value = value.substring(0, 11)
  }
  
  formData.value.phone = value
  target.value = value
}

// reCAPTCHA 초기화
const initializeRecaptcha = async () => {
  if (recaptchaVerifier.value) {
    return recaptchaVerifier.value
  }

  if (!$auth) {
    throw new Error('Firebase auth not initialized')
  }
  
  const container = document.getElementById('recaptcha-container')
  if (container) {
    container.innerHTML = ''
  }
  
  recaptchaVerifier.value = new $RecaptchaVerifier($auth, 'recaptcha-container', {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA solved')
    }
  })
  
  await recaptchaVerifier.value.render()
  
  return recaptchaVerifier.value
}

const sendVerificationCode = async () => {
  if (!validatePhoneNumber(formData.value.phone)) {
    error.value = '올바른 전화번호 형식을 입력해주세요. (01012345678)'
    return
  }

  loading.value = true
  error.value = ''

  try {
    if (!$auth) {
      throw new Error('Firebase auth not initialized')
    }
    
    const verifier = await initializeRecaptcha()

    const phoneNumber = '+82' + formData.value.phone.substring(1)
    
    console.log('인증번호 전송 시도:', phoneNumber)
    confirmationResult.value = await signInWithPhoneNumber($auth, phoneNumber, verifier)
    
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

    const result = await signInWithCredential($auth, credential)
    console.log('인증 성공:', result.user)

    // Firestore에서 사용자 정보 확인
    const userDoc = await getDoc(doc($db, 'users', result.user.uid))
    
    if (userDoc.exists()) {
      const userData = userDoc.data()
      
      // 파트너 역할인지 확인
      if (userData.role !== 'partner') {
        await $auth.signOut()
        error.value = '파트너 계정이 아닙니다. 고객 로그인을 이용해주세요.'
        return
      }

      // 승인 상태 확인
      if (userData.approvalStatus === 'pending') {
        await $auth.signOut()
        error.value = '승인 대기 중인 계정입니다. 승인 후 로그인해주세요.'
        return
      }

      if (userData.approvalStatus === 'rejected') {
        await $auth.signOut()
        error.value = '승인이 거절된 계정입니다. 관리자에게 문의해주세요.'
        return
      }

      // 사용자 정보를 스토어에 저장
      await userStore.setUser(result.user, userData)
      
      console.log('파트너 로그인 성공')
      router.push('/partner')
    } else {
      await $auth.signOut()
      error.value = '등록되지 않은 계정입니다. 회원가입을 먼저 진행해주세요.'
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
</script>
