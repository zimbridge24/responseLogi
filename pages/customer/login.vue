<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          고객 로그인
        </h2>
        <p class="text-gray-600">
          계정이 없으신가요?
          <NuxtLink to="/customer/register" class="font-bold text-blue-600 hover:text-blue-800 transition-colors underline ml-1">
            회원가입하기
          </NuxtLink>
        </p>
      </div>

      <!-- Form -->
      <div class="card">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Phone Number -->
          <div>
            <label for="phone" class="form-label">전화번호 (숫자만 입력하세요)</label>
            <div class="flex space-x-2">
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                required
                class="form-input flex-1"
                placeholder="01012345678"
                :disabled="verificationSent"
                @input="formatPhoneNumber"
                maxlength="11"
              />
              <button
                type="button"
                @click="sendVerificationCode"
                :disabled="!formData.phone || verificationSent || loading"
                class="px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ verificationSent ? '전송완료' : '인증번호' }}
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">예: 01012345678 (하이픈 없이 숫자만 입력)</p>
          </div>

          <!-- Verification Code -->
          <div v-if="verificationSent">
            <label for="verificationCode" class="form-label">인증번호</label>
            <div class="flex space-x-2">
              <input
                id="verificationCode"
                v-model="formData.verificationCode"
                type="text"
                required
                class="form-input flex-1"
                placeholder="6자리 인증번호"
                maxlength="6"
              />
              <button
                type="button"
                @click="verifyCode"
                :disabled="!formData.verificationCode || loading"
                class="px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                확인
              </button>
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

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="!verificationSent || loading"
              class="btn-primary w-full flex justify-center items-center py-4 px-6 text-lg font-semibold"
            >
              <svg v-if="loading" class="loading-spinner -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? '로그인 중...' : '로그인하기' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- reCAPTCHA Container -->
    <div id="recaptcha-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth'

// 폼 데이터
const formData = ref({
  phone: '',
  verificationCode: ''
})

const loading = ref(false)
const error = ref('')
const verificationSent = ref(false)
const confirmationResult = ref<any>(null)
const recaptchaVerifier = ref<any>(null)

// 전화번호 형식 검증 (숫자만)
const validatePhoneNumber = (phone: string) => {
  const phoneRegex = /^010\d{8}$/
  return phoneRegex.test(phone)
}

// 전화번호 포맷팅 (숫자만 입력되도록)
const formatPhoneNumber = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '') // 숫자가 아닌 문자 제거
  
  // 010으로 시작하지 않으면 010 추가
  if (value.length > 0 && !value.startsWith('010')) {
    value = '010' + value
  }
  
  // 최대 11자리로 제한
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

  const { $auth, $RecaptchaVerifier } = useNuxtApp()
  
  if (!$auth) {
    throw new Error('Firebase auth not initialized')
  }
  
  // 기존 reCAPTCHA 제거
  const container = document.getElementById('recaptcha-container')
  if (container) {
    container.innerHTML = ''
  }
  
  // reCAPTCHA 설정
  recaptchaVerifier.value = new $RecaptchaVerifier($auth, 'recaptcha-container', {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA solved')
    }
  })
  
  // reCAPTCHA 렌더링
  await recaptchaVerifier.value.render()
  
  return recaptchaVerifier.value
}

// 인증번호 전송
const sendVerificationCode = async () => {
  if (!validatePhoneNumber(formData.value.phone)) {
    error.value = '올바른 전화번호 형식을 입력해주세요. (01012345678)'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { $auth } = useNuxtApp()
    
    if (!$auth) {
      throw new Error('Firebase auth not initialized')
    }
    
    // reCAPTCHA 초기화
    const verifier = await initializeRecaptcha()

    // 전화번호에 +82 국가코드 추가 (010 제거하고 +82 추가)
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

// 인증번호 확인 및 로그인
const verifyCode = async () => {
  if (!formData.value.verificationCode || formData.value.verificationCode.length !== 6) {
    error.value = '6자리 인증번호를 입력해주세요.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { $auth } = useNuxtApp()
    const credential = PhoneAuthProvider.credential(confirmationResult.value.verificationId, formData.value.verificationCode)
    const result = await signInWithCredential($auth, credential)
    
    console.log('로그인 성공:', result.user.uid)
    
    // 고객 요청 페이지로 리다이렉트
    await navigateTo('/customer/requests')
    
  } catch (err: any) {
    console.error('로그인 실패:', err)
    if (err.code === 'auth/invalid-verification-code') {
      error.value = '잘못된 인증번호입니다.'
    } else if (err.code === 'auth/code-expired') {
      error.value = '인증번호가 만료되었습니다. 다시 요청해주세요.'
    } else {
      error.value = '로그인에 실패했습니다.'
    }
  } finally {
    loading.value = false
  }
}

// 폼 제출 처리
const handleSubmit = async () => {
  if (!verificationSent.value) {
    await sendVerificationCode()
  } else {
    await verifyCode()
  }
}
</script>

<style scoped>
/* reCAPTCHA 컨테이너 숨김 */
#recaptcha-container {
  display: none;
}
</style>
