<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute top-40 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Navigation -->
    <BaseNavbar />

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
                <textarea id="specialRequirements" v-model="form.specialRequirements" class="form-input h-24" placeholder="냉장/냉동 보관, 특수 물품 등 특별한 요구사항이 있다면 입력해주세요"></textarea>
              </div>
            </div>
          </div>


          <!-- 제출 버튼 -->
          <div class="flex justify-center pt-6">
            <button 
              type="submit" 
              :disabled="loading"
              class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                제출 중...
              </span>
              <span v-else>견적 신청하기</span>
            </button>
          </div>
        </form>

        <!-- 성공 메시지 -->
        <div v-if="successMessage" class="text-center py-12">
          <div class="text-6xl mb-4">✅</div>
          <h2 class="text-3xl font-bold text-green-600 mb-4">견적 신청 완료!</h2>
          <p class="text-gray-600 mb-6">견적 신청이 성공적으로 제출되었습니다.</p>
          <p class="text-gray-500 text-sm mb-8">파트너들이 견적서를 제출하면 알림을 받으실 수 있습니다.</p>
          <div class="flex justify-center space-x-4">
            <NuxtLink 
              to="/customer/requests" 
              class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              내 견적 확인하기
            </NuxtLink>
            <NuxtLink 
              to="/" 
              class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              홈으로 돌아가기
            </NuxtLink>
          </div>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-600 text-sm">{{ errorMessage }}</p>
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

// Initialize auth listener
user.initializeAuth()

onMounted(async () => {
  // 인증 상태가 준비될 때까지 대기
  let attempts = 0
  const maxAttempts = 50 // 5초 (100ms * 50)
  
  while (!user.authReady && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }
  
  if (!user.isLoggedIn) {
    navigateTo('/login')
    return
  }
})

// 폼 데이터
const form = ref({
  pallets: null,
  boxes: null,
  storagePeriod: null,
  storagePeriodUnit: 'month',
  locationPreference: '',
  specialRequirements: ''
})

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')


// 견적 신청 제출
const submitRequest = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    console.log('=== 견적 신청 시작 ===')
    
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    const userId = user.currentUser?.uid
    console.log('사용자 ID:', userId)
    
    const requestData = {
      customerId: userId,
      pallets: form.value.pallets,
      boxes: form.value.boxes,
      storagePeriod: form.value.storagePeriod,
      storagePeriodUnit: form.value.storagePeriodUnit,
      locationPreference: form.value.locationPreference,
      specialRequirements: form.value.specialRequirements,
      status: 'pending',
      createdAt: new Date(),
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
    
    // 저장된 데이터 확인
    console.log('저장된 데이터 확인 중...')
    const savedRequest = await firestoreService.getWarehouseRequest(requestId)
    console.log('저장된 견적 신청서:', savedRequest)
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