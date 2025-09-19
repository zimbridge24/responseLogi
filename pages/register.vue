<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <!-- 타이틀 -->
        <h2 class="text-3xl font-bold text-gray-900">
          회원가입
        </h2>

        <!-- 로그인 안내 -->
        <p class="mt-2 text-sm text-gray-600">
          이미 계정이 있으신가요?
          <NuxtLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            로그인하기
          </NuxtLink>
        </p>
      </div>

      <!-- Form -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Company Name -->
          <div>
            <label for="companyName" class="block text-sm font-medium text-gray-700 mb-2">회사명</label>
            <input
              id="companyName"
              v-model="formData.companyName"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="(주)회사명"
            />
          </div>

          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">이름</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="홍길동"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="example@email.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="최소 6자 이상"
            />
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          <!-- Phone -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="010-1234-5678"
            />
          </div>

          <!-- Role Selection -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-2">역할 선택</label>
            <select
              id="role"
              v-model="formData.role"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="customer">고객</option>
              <option value="partner">파트너</option>
            </select>
          </div>

          <!-- KYC 서류 업로드 (파트너만) -->
          <div v-if="formData.role === 'partner'" class="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <h3 class="text-lg font-semibold text-yellow-900 mb-4">KYC 서류 제출</h3>
            <p class="text-sm text-yellow-800 mb-4">파트너 가입을 위해 다음 서류를 제출해주세요. 관리자 승인 후 파트너 권한이 부여됩니다.</p>
            
            <div class="space-y-4">
              <!-- 사업자등록증 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">사업자등록증 (필수)</label>
                <input
                  type="file"
                  @change="handleFileUpload($event, 'businessLicense')"
                  accept=".pdf,.jpg,.jpeg,.png"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <p v-if="formData.businessLicense" class="text-sm text-green-600 mt-1">✓ 사업자등록증 업로드 완료</p>
              </div>

              <!-- 보험증권 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">보험증권 (필수)</label>
                <input
                  type="file"
                  @change="handleFileUpload($event, 'insurancePolicy')"
                  accept=".pdf,.jpg,.jpeg,.png"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <p v-if="formData.insurancePolicy" class="text-sm text-green-600 mt-1">✓ 보험증권 업로드 완료</p>
              </div>

              <!-- 창고 사진 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">창고 사진 (필수)</label>
                <input
                  type="file"
                  @change="handleFileUpload($event, 'warehousePhoto')"
                  accept=".jpg,.jpeg,.png"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <p v-if="formData.warehousePhoto" class="text-sm text-green-600 mt-1">✓ 창고 사진 업로드 완료</p>
              </div>
            </div>
          </div>


          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? '가입 중...' : '회원가입하기' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Error Popup -->
    <div v-if="showErrorPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">회원가입 실패</h3>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <button 
            @click="closeErrorPopup"
            class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 폼 데이터
const formData = ref({
  companyName: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  role: 'customer', // 기본값을 고객으로 설정
  // KYC 서류 (파트너만)
  businessLicense: null as File | null,
  insurancePolicy: null as File | null,
  warehousePhoto: null as File | null
})

const loading = ref(false)
const error = ref('')
const showErrorPopup = ref(false)

// 이메일과 전화번호 중복 체크 함수
const checkDuplicates = async (email: string, phone: string) => {
  try {
    const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore')
    const config = useRuntimeConfig().public
    
    const firebaseConfig = {
      apiKey: config.FIREBASE_API_KEY,
      authDomain: config.FIREBASE_AUTH_DOMAIN,
      projectId: config.FIREBASE_PROJECT_ID,
      storageBucket: config.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
      appId: config.FIREBASE_APP_ID,
    }
    
    const { initializeApp, getApps } = await import('firebase/app')
    let app
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }
    
    const db = getFirestore(app)
    
    // 이메일 중복 체크
    const emailQuery = query(collection(db, 'users'), where('email', '==', email))
    const emailSnapshot = await getDocs(emailQuery)
    
    if (!emailSnapshot.empty) {
      throw new Error('EMAIL_EXISTS')
    }
    
    // 전화번호 중복 체크
    const phoneQuery = query(collection(db, 'users'), where('phone', '==', phone))
    const phoneSnapshot = await getDocs(phoneQuery)
    
    if (!phoneSnapshot.empty) {
      throw new Error('PHONE_EXISTS')
    }
    
    return true
  } catch (err: any) {
    throw err
  }
}

// 팝업 닫기 함수
const closeErrorPopup = () => {
  showErrorPopup.value = false
  error.value = ''
}

// 파일 업로드 핸들러
const handleFileUpload = (event: Event, field: string) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formData.value[field as keyof typeof formData.value] = target.files[0] as any
  }
}

// 파트너 KYC 서류 검증
const validatePartnerDocuments = () => {
  if (formData.value.role === 'partner') {
    if (!formData.value.businessLicense) {
      error.value = '사업자등록증을 업로드해주세요.'
      return false
    }
    if (!formData.value.insurancePolicy) {
      error.value = '보험증권을 업로드해주세요.'
      return false
    }
    if (!formData.value.warehousePhoto) {
      error.value = '창고 사진을 업로드해주세요.'
      return false
    }
  }
  return true
}

const handleSubmit = async () => {
  // 기본 검증
  if (!formData.value.companyName) {
    error.value = '회사명을 입력해주세요.'
    showErrorPopup.value = true
    return
  }
  
  if (!formData.value.name) {
    error.value = '이름을 입력해주세요.'
    showErrorPopup.value = true
    return
  }
  
  if (!formData.value.email) {
    error.value = '이메일을 입력해주세요.'
    showErrorPopup.value = true
    return
  }
  
      if (!formData.value.password || formData.value.password.length < 6) {
        error.value = '비밀번호는 최소 6자 이상이어야 합니다.'
        showErrorPopup.value = true
        return
      }
      
      if (formData.value.password !== formData.value.confirmPassword) {
        error.value = '비밀번호가 일치하지 않습니다.'
        showErrorPopup.value = true
        return
      }
      
      if (!formData.value.phone || !formData.value.phone.trim()) {
        error.value = '전화번호를 입력해주세요.'
        showErrorPopup.value = true
        return
      }
      
  if (!formData.value.role) {
    error.value = '역할을 선택해주세요.'
    showErrorPopup.value = true
    return
  }

  // 파트너 KYC 서류 검증
  if (!validatePartnerDocuments()) {
    showErrorPopup.value = true
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    console.log('회원가입 시작:', formData.value)
    
    // 1. 이메일과 전화번호 중복 체크
    await checkDuplicates(formData.value.email, formData.value.phone)
    
    // Firebase 직접 초기화 (테스트에서 성공한 방식)
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
    
    // Firebase 앱 초기화
    let app
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }
    
    const auth = getAuth(app)
    const db = getFirestore(app)
    
    console.log('Firebase 초기화 완료')
    
    // 1. Firebase Auth에 사용자 생성
    console.log('사용자 생성 시도:', formData.value.email)
    const userCredential = await createUserWithEmailAndPassword(auth, formData.value.email, formData.value.password)
    const user = userCredential.user
    
    console.log('사용자 생성 성공:', user.uid)
    
    // 2. 사용자 프로필 업데이트 (이름)
    await updateProfile(user, {
      displayName: formData.value.name
    })
    
    console.log('프로필 업데이트 완료')
    
               // 3. Firestore에 사용자 정보 저장
               const userData = {
                 companyName: formData.value.companyName,
                 name: formData.value.name,
                 email: formData.value.email,
                 phone: formData.value.phone,
                 role: formData.value.role,
                 // 파트너인 경우 KYC 정보 추가
                 ...(formData.value.role === 'partner' && {
                   approvalStatus: 'pending', // pending, approved, rejected
                   kycDocuments: {
                     businessLicense: formData.value.businessLicense?.name || '',
                     insurancePolicy: formData.value.insurancePolicy?.name || '',
                     warehousePhoto: formData.value.warehousePhoto?.name || ''
                   }
                 }),
                 createdAt: new Date(),
                 updatedAt: new Date(),
               }
    
    console.log('Firestore 저장 시도:', userData)
    await setDoc(doc(db, 'users', user.uid), userData)
    
        console.log('Firestore 저장 성공!')
        
        // 4. 잠시 대기 후 역할에 따른 리다이렉트 (사용자 프로필 로딩 대기)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        if (formData.value.role === 'customer') {
          navigateTo('/customer/requests')
        } else if (formData.value.role === 'partner') {
          // 파트너는 승인 대기 페이지로 이동
          navigateTo('/partner/pending')
        } else {
          navigateTo('/')
        }
  } catch (err: any) {
    console.error('Registration error:', err)
    
    // 중복 체크 에러 처리
    if (err.message === 'EMAIL_EXISTS') {
      error.value = '이미 가입된 이메일입니다.'
    } else if (err.message === 'PHONE_EXISTS') {
      error.value = '이미 가입된 전화번호입니다.'
    }
    // Firebase 에러 메시지 처리
    else if (err.code === 'auth/email-already-in-use') {
      error.value = '이미 사용 중인 이메일입니다.'
    } else if (err.code === 'auth/weak-password') {
      error.value = '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.'
    } else if (err.code === 'auth/invalid-email') {
      error.value = '유효하지 않은 이메일 형식입니다.'
    } else {
      error.value = '회원가입에 실패했습니다. 다시 시도해주세요.'
    }
    
    showErrorPopup.value = true
  } finally {
    loading.value = false
  }
}
</script>
