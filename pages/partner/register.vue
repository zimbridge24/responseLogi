<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          파트너 회원가입
        </h2>
        <p class="text-gray-600">
          이미 계정이 있으신가요?
          <NuxtLink to="/login" class="font-bold text-green-600 hover:text-green-800 transition-colors underline ml-1">
            로그인하기
          </NuxtLink>
        </p>
      </div>

      <!-- Form -->
      <div class="card">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Company Name -->
          <div>
            <label for="companyName" class="form-label">회사명</label>
            <input
              id="companyName"
              v-model="formData.companyName"
              type="text"
              required
              class="form-input"
              placeholder="(주)회사명"
            />
          </div>

          <!-- Name -->
          <div>
            <label for="name" class="form-label">담당자 이름</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              class="form-input"
              placeholder="홍길동"
            />
          </div>

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
                class="px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                :disabled="!formData.verificationCode || codeVerified || loading"
                class="px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ codeVerified ? '인증완료' : '확인' }}
              </button>
            </div>
            <p v-if="codeVerified" class="text-sm text-green-600 mt-2">✓ 전화번호 인증이 완료되었습니다</p>
          </div>

          <!-- KYC 서류 업로드 -->
          <div class="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <h3 class="text-lg font-semibold text-yellow-900 mb-4">📋 필수 서류 제출</h3>
            <p class="text-sm text-yellow-800 mb-4">⚠️ <strong>모든 서류는 필수입니다!</strong> 파트너 가입을 위해 다음 서류를 모두 제출해주세요. 관리자 승인 후 파트너 권한이 부여됩니다.</p>
            
            <div class="space-y-4">
              <!-- 사업자등록증 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  사업자등록증 
                  <span class="text-red-500 font-bold">*</span>
                  <span class="text-xs text-red-600 ml-1">(필수)</span>
                </label>
                <input
                  type="file"
                  @change="handleFileUpload($event, 'businessLicense')"
                  accept=".pdf,.jpg,.jpeg,.png"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
                <p v-if="formData.businessLicense" class="text-sm text-green-600 mt-1">✓ 사업자등록증 업로드 완료</p>
              </div>

              <!-- 보험증권 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  보험증권 
                  <span class="text-red-500 font-bold">*</span>
                  <span class="text-xs text-red-600 ml-1">(필수)</span>
                </label>
                <input
                  type="file"
                  @change="handleFileUpload($event, 'insurancePolicy')"
                  accept=".pdf,.jpg,.jpeg,.png"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
                <p v-if="formData.insurancePolicy" class="text-sm text-green-600 mt-1">✓ 보험증권 업로드 완료</p>
              </div>

              <!-- 창고 사진 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  창고 사진 
                  <span class="text-red-500 font-bold">*</span>
                  <span class="text-xs text-red-600 ml-1">(필수)</span>
                </label>
                <input
                  type="file"
                  @change="handleFileUpload($event, 'warehousePhoto')"
                  accept=".jpg,.jpeg,.png"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
                <p v-if="formData.warehousePhoto" class="text-sm text-green-600 mt-1">✓ 창고 사진 업로드 완료</p>
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
                <p class="text-sm text-red-800 font-medium whitespace-pre-line">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="!codeVerified || !allDocumentsUploaded || loading"
              class="btn-primary w-full flex justify-center items-center py-4 px-6 text-lg font-semibold"
            >
              <svg v-if="loading" class="loading-spinner -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? '가입 중...' : '회원가입하기' }}
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth'
// import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage' // CORS 문제로 임시 비활성화
import { doc, setDoc, getFirestore, collection, query, where, getDocs } from 'firebase/firestore'

const { $auth, $db, $RecaptchaVerifier } = useNuxtApp()
const router = useRouter()

// 폼 데이터
const formData = ref({
  companyName: '',
  name: '',
  phone: '',
  verificationCode: '',
  // KYC 서류
  businessLicense: null as File | null,
  insurancePolicy: null as File | null,
  warehousePhoto: null as File | null
})

const loading = ref(false)
const error = ref('')
const verificationSent = ref(false)
const codeVerified = ref(false)
const confirmationResult = ref<any>(null)
const recaptchaVerifier = ref<any>(null)

// 모든 서류가 업로드되었는지 확인
const allDocumentsUploaded = computed(() => {
  return formData.value.businessLicense && 
         formData.value.insurancePolicy && 
         formData.value.warehousePhoto
})

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

// 파일 업로드 핸들러
const handleFileUpload = (event: Event, field: string) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formData.value[field as keyof typeof formData.value] = target.files[0] as any
  }
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
    } else {
      error.value = '인증번호 전송에 실패했습니다. 다시 시도해주세요.'
    }
  } finally {
    loading.value = false
  }
}

// 인증번호 확인
const verifyCode = async () => {
  if (!formData.value.verificationCode || formData.value.verificationCode.length !== 6) {
    error.value = '6자리 인증번호를 입력해주세요.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const credential = PhoneAuthProvider.credential(confirmationResult.value.verificationId, formData.value.verificationCode)
    const result = await signInWithCredential($auth, credential)
    
    console.log('인증번호 확인 성공:', result.user.uid)
    codeVerified.value = true
  } catch (err: any) {
    console.error('인증번호 확인 실패:', err)
    if (err.code === 'auth/invalid-verification-code') {
      error.value = '잘못된 인증번호입니다.'
    } else if (err.code === 'auth/code-expired') {
      error.value = '인증번호가 만료되었습니다. 다시 요청해주세요.'
    } else {
      error.value = '인증번호 확인에 실패했습니다.'
    }
  } finally {
    loading.value = false
  }
}

// 파일을 Base64로 변환하여 Firestore에 저장 (CORS 문제 해결)
const uploadFile = async (file: File, path: string) => {
  try {
    console.log('파일 처리 시작 (Base64 방식):', path, '파일 크기:', file.size, '파일 타입:', file.type)
    
    // 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('파일 크기가 너무 큽니다. 5MB 이하의 파일을 업로드해주세요.')
    }
    
    // 파일을 Base64로 변환
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // data:image/png;base64, 부분 제거
        const base64Data = result.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    
    console.log('파일 Base64 변환 완료:', path)
    
    // Firestore에 파일 데이터 저장
    const fileData = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      base64Data: base64,
      uploadedAt: new Date(),
      path: path
    }
    
    // 임시로 파일 ID 생성
    const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Firestore에 파일 데이터 저장
    await setDoc(doc($db, 'files', fileId), fileData)
    
    console.log('파일 데이터 Firestore 저장 완료:', fileId)
    
    // 다운로드 URL 대신 파일 ID 반환
    return `firestore://files/${fileId}`
    
  } catch (error) {
    console.error('파일 처리 실패:', path, error)
    console.error('에러 상세:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}

// 회원가입 처리
const handleSubmit = async () => {
  if (!formData.value.companyName.trim()) {
    error.value = '회사명을 입력해주세요.'
    return
  }

  if (!formData.value.name.trim()) {
    error.value = '담당자 이름을 입력해주세요.'
    return
  }

  if (!codeVerified.value) {
    error.value = '전화번호 인증을 완료해주세요.'
    return
  }

  if (!allDocumentsUploaded.value) {
    // 누락된 서류 확인
    const missingDocuments = []
    if (!formData.value.businessLicense) missingDocuments.push('사업자등록증')
    if (!formData.value.insurancePolicy) missingDocuments.push('보험증권')
    if (!formData.value.warehousePhoto) missingDocuments.push('창고 사진')
    
    error.value = `필수 서류를 제출해주세요!\n\n누락된 서류: ${missingDocuments.join(', ')}\n\n모든 서류를 업로드한 후 회원가입을 완료해주세요.`
    return
  }

  loading.value = true
  error.value = ''

  try {
    // 현재 인증된 사용자 정보 가져오기
    const currentUser = $auth.currentUser
    if (!currentUser) {
      throw new Error('인증된 사용자 정보를 찾을 수 없습니다.')
    }

    // 파일들을 Firestore에 저장 (Base64 인코딩)
    const userId = currentUser.uid
    console.log('파일 처리 시작 - 사용자 ID:', userId)
    
    const uploadPromises = [
      uploadFile(formData.value.businessLicense!, `kyc/${userId}/businessLicense.${formData.value.businessLicense!.name.split('.').pop()}`),
      uploadFile(formData.value.insurancePolicy!, `kyc/${userId}/insurancePolicy.${formData.value.insurancePolicy!.name.split('.').pop()}`),
      uploadFile(formData.value.warehousePhoto!, `kyc/${userId}/warehousePhoto.${formData.value.warehousePhoto!.name.split('.').pop()}`)
    ]

    let businessLicenseUrl, insurancePolicyUrl, warehousePhotoUrl
    
    try {
      [businessLicenseUrl, insurancePolicyUrl, warehousePhotoUrl] = await Promise.all(uploadPromises)
      console.log('모든 파일 업로드 완료')
    } catch (uploadError) {
      console.error('파일 처리 중 오류 발생:', uploadError)
      throw new Error('파일 처리에 실패했습니다. 다시 시도해주세요.')
    }

    // Firestore에 사용자 정보 저장
    const userData = {
      companyName: formData.value.companyName,
      name: formData.value.name,
      phone: formData.value.phone,
      role: 'partner',
      approvalStatus: 'pending', // pending, approved, rejected
      kycDocuments: {
        businessLicense: {
          fileName: formData.value.businessLicense!.name,
          downloadUrl: businessLicenseUrl
        },
        insurancePolicy: {
          fileName: formData.value.insurancePolicy!.name,
          downloadUrl: insurancePolicyUrl
        },
        warehousePhoto: {
          fileName: formData.value.warehousePhoto!.name,
          downloadUrl: warehousePhotoUrl
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await setDoc(doc($db, 'users', currentUser.uid), userData)
    
    console.log('파트너 회원가입 완료:', currentUser.uid)
    
    // 파트너 승인 대기 페이지로 리다이렉트
    console.log('파트너 회원가입 성공, 승인 대기 페이지로 이동')
    await router.push('/partner/pending')
    
  } catch (err: any) {
    console.error('회원가입 실패:', err)
    error.value = '회원가입에 실패했습니다. 다시 시도해주세요.'
  } finally {
    loading.value = false
  }
}

// 페이지 마운트 시 초기화
onMounted(() => {
  // 필요한 초기화 작업만 수행
  console.log('파트너 회원가입 페이지 로드됨')
})

// 페이지 언마운트 시 정리
onUnmounted(() => {
  // 필요한 정리 작업만 수행
  console.log('파트너 회원가입 페이지 언마운트됨')
})
</script>

<style scoped>
/* reCAPTCHA 컨테이너 숨김 */
#recaptcha-container {
  display: none;
}
</style>
