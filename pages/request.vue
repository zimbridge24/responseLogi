<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute top-40 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Navigation -->
    <nav class="relative z-10 flex justify-between items-center px-8 py-6 backdrop-blur-sm bg-white/80 border-b border-white/20">
      <div class="flex items-center space-x-3">
        <NuxtLink to="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white text-xl">📦</span>
          </div>
          <span class="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            응답하라 창고
          </span>
        </NuxtLink>
      </div>
      <div class="flex items-center space-x-8">
        <!-- 홈으로 돌아가기 버튼 -->
        <NuxtLink
          to="/"
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          홈으로
        </NuxtLink>
        
        <!-- 로그인되지 않은 경우 -->
        <template v-if="!user.isLoggedIn">
          <div class="w-px h-6 bg-gray-300"></div>
          <NuxtLink
            to="/login"
            class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
          >
            로그인
          </NuxtLink>
          <div class="w-px h-6 bg-gray-300"></div>
          <NuxtLink
            to="/register"
            class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
          >
            회원가입
          </NuxtLink>
        </template>
        
        <!-- 로그인된 경우 -->
        <template v-else>
          <div class="w-px h-6 bg-gray-300"></div>
          <div class="text-gray-800 font-semibold text-lg">
            {{ user.user?.name || '사용자' }}님
          </div>
          <div class="w-px h-6 bg-gray-300"></div>
          <button 
            @click="handleLogout"
            class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
          >
            로그아웃
          </button>
        </template>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="relative z-10 flex flex-col items-center justify-center flex-1 px-8 py-16">
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 max-w-3xl w-full">
        <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">견적 신청하기</h1>


        <!-- 견적 신청 폼 -->
        <form v-if="!successMessage" @submit.prevent="submitRequest" class="space-y-6">
          <!-- 창고 요구사항 -->
          <div>
            <h2 class="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">창고 요구사항</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="pallets" class="block text-sm font-medium text-gray-700 mb-1">팔렛 수</label>
                <input type="number" id="pallets" v-model.number="form.pallets" class="form-input" min="1" required />
              </div>
              <div>
                <label for="boxes" class="block text-sm font-medium text-gray-700 mb-1">박스 수</label>
                <input type="number" id="boxes" v-model.number="form.boxes" class="form-input" min="1" required />
              </div>
            </div>
          </div>

          <!-- 입고 기간 -->
          <div>
            <h2 class="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">입고 기간</h2>
            <div class="flex items-end space-x-4">
              <div class="flex-1">
                <label for="storagePeriod" class="block text-sm font-medium text-gray-700 mb-1">기간</label>
                <input type="number" id="storagePeriod" v-model.number="form.storagePeriod" class="form-input" min="1" required />
              </div>
              <div class="w-32">
                <label for="storagePeriodUnit" class="block text-sm font-medium text-gray-700 mb-1">단위</label>
                <select id="storagePeriodUnit" v-model="form.storagePeriodUnit" class="form-input">
                  <option value="day">일</option>
                  <option value="month">월</option>
                  <option value="year">년</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 추가 정보 -->
          <div>
            <h2 class="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">추가 정보</h2>
            <div class="space-y-4">
              <div>
                <label for="locationPreference" class="block text-sm font-medium text-gray-700 mb-1">창고 위치 선호도</label>
                <input type="text" id="locationPreference" v-model="form.locationPreference" class="form-input" placeholder="예: 서울 근교, 경기도 이천 등" />
              </div>
              <div>
                <label for="specialRequirements" class="block text-sm font-medium text-gray-700 mb-1">특별 요구사항</label>
                <textarea id="specialRequirements" v-model="form.specialRequirements" rows="4" class="form-input" placeholder="예: 냉장/냉동 창고, 특정 보안 요구사항 등"></textarea>
              </div>
            </div>
          </div>

          <!-- 에러 메시지 -->
          <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">{{ errorMessage }}</span>
          </div>

          <!-- 제출 버튼 -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              신청 중...
            </span>
            <span v-else>🚀 견적 신청하기</span>
          </button>
        </form>

        <!-- 성공 메시지와 견적확인 버튼 -->
        <div v-if="successMessage" class="text-center py-12">
          <div class="mb-6">
            <div class="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">견적 신청이 완료되었습니다!</h2>
            <p class="text-lg text-gray-600">응답이 올 때까지 기다려주세요.</p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button 
              @click="goToRequests"
              class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span class="mr-2">📋</span>
              신청한 견적 확인
            </button>
            <button 
              @click="goToRequests"
              class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span class="mr-2">📄</span>
              견적서 확인
            </button>
          </div>
          
          <div class="mt-6">
            <button 
              @click="resetForm"
              class="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              새 견적 신청하기
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FirestoreService } from '~/lib/services/firestore'

// 로그인 체크
const user = useUserStore()

onMounted(() => {
  if (!user.isLoggedIn) {
    navigateTo('/login')
  }
})

const form = ref({
  pallets: 1,
  boxes: 1,
  storagePeriod: 1,
  storagePeriodUnit: 'month', // 기본값을 월로 설정
  locationPreference: '',
  specialRequirements: '',
})

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// 로그아웃 함수
const handleLogout = async () => {
  try {
    await user.logout()
    // 로그아웃 후 메인 페이지로 리다이렉트
    navigateTo('/')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}

// 폼 리셋 함수
const resetForm = () => {
  successMessage.value = ''
  errorMessage.value = ''
  form.value = {
    pallets: 1,
    boxes: 1,
    storagePeriod: 1,
    storagePeriodUnit: 'month',
    locationPreference: '',
    specialRequirements: '',
  }
}

// 견적 확인 페이지로 이동
const goToRequests = () => {
  navigateTo('/customer/requests')
}

const submitRequest = async () => {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    // Firestore 서비스 가져오기
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)

    // 사용자 정보 확인 및 디버깅
    const userId = user.currentUser?.uid
    console.log('=== 견적 신청 시작 ===')
    console.log('견적 신청 시 사용자 ID:', userId)
    console.log('견적 신청 시 사용자 정보:', user.user)
    console.log('currentUser 전체:', user.currentUser)
    console.log('isLoggedIn:', user.isLoggedIn)

    // 견적 신청 데이터 생성
    const requestData = {
      customerId: userId || '',
      customerName: user.user?.name || '',
      customerCompany: user.user?.companyName || '',
      customerPhone: user.user?.phone || '',
      customerEmail: user.user?.email || '',
      pallets: form.value.pallets,
      boxes: form.value.boxes,
      storagePeriod: form.value.storagePeriod,
      storagePeriodUnit: form.value.storagePeriodUnit,
      locationPreference: form.value.locationPreference || '',
      specialRequirements: form.value.specialRequirements || '',
      status: 'pending' as const,
      maxQuotes: 7,
      currentQuoteCount: 0
    }

    console.log('견적 신청 데이터:', requestData)

    if (!userId) {
      throw new Error('사용자 ID가 없습니다. 로그인 상태를 확인해주세요.')
    }

    // Firestore에 견적 신청 저장
    console.log('Firestore에 데이터 저장 중...')
    const requestId = await firestoreService.createWarehouseRequest(requestData)
    console.log('견적 신청이 저장되었습니다. ID:', requestId)
    console.log('=== 견적 신청 완료 ===')

    successMessage.value = 'success'
  } catch (error) {
    console.error('견적 신청 실패:', error)
    errorMessage.value = '견적 신청에 실패했습니다. 다시 시도해주세요.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.form-input {
  @apply w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200;
}
</style>