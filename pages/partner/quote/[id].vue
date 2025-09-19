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
        <NuxtLink to="/partner/requests" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white text-xl">📦</span>
          </div>
          <span class="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            응답하라 창고
          </span>
        </NuxtLink>
      </div>
      <div class="flex items-center space-x-8">
        <div class="text-gray-800 font-semibold text-lg">
          {{ user.user?.name || '사용자' }}님 (파트너)
        </div>
        <div class="w-px h-6 bg-gray-300"></div>
        <button 
          @click="handleLogout"
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          로그아웃
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="relative z-10 px-8 py-16">
      <div class="max-w-4xl mx-auto">
        <!-- 로딩 상태 -->
        <div v-if="loading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">견적 정보를 불러오는 중...</p>
        </div>

        <!-- 견적 신청서 정보 -->
        <div v-else-if="request" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 mb-8">
          <div class="flex justify-between items-start mb-6">
            <h1 class="text-3xl font-bold text-gray-900">견적 응답하기</h1>
            <NuxtLink 
              to="/partner/requests"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              목록으로 돌아가기
            </NuxtLink>
          </div>

          <!-- 고객 정보 -->
          <div class="bg-blue-50 rounded-xl p-6 mb-6">
            <h2 class="text-xl font-semibold text-blue-900 mb-4">고객 정보</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span class="font-medium text-blue-800">회사명:</span> {{ request.customerCompany }}</div>
              <div><span class="font-medium text-blue-800">담당자:</span> {{ request.customerName }}</div>
              <div><span class="font-medium text-blue-800">연락처:</span> {{ request.customerPhone }}</div>
              <div><span class="font-medium text-blue-800">이메일:</span> {{ request.customerEmail }}</div>
            </div>
          </div>

          <!-- 견적 요구사항 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">창고 요구사항</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">팔렛 수</span>
                  <span class="font-semibold">{{ request.pallets }}개</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">박스 수</span>
                  <span class="font-semibold">{{ request.boxes }}개</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">보관 기간</span>
                  <span class="font-semibold">{{ request.storagePeriod }}{{ getPeriodUnit(request.storagePeriodUnit) }}</span>
                </div>
                <div v-if="request.locationPreference" class="flex justify-between">
                  <span class="text-gray-600">선호 위치</span>
                  <span class="font-semibold">{{ request.locationPreference }}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">현재 상태</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">신청일</span>
                  <span class="font-semibold">{{ formatDate(request.createdAt) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">받은 견적</span>
                  <span class="font-semibold text-blue-600">{{ request.currentQuoteCount }}/7</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">상태</span>
                  <span :class="getStatusClass(request.status)" class="px-2 py-1 rounded-full text-sm font-medium">
                    {{ getStatusText(request.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 특별 요구사항 -->
          <div v-if="request.specialRequirements" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">특별 요구사항</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-700">{{ request.specialRequirements }}</p>
            </div>
          </div>
        </div>

        <!-- 견적 응답 폼 -->
        <div v-if="request && request.currentQuoteCount < 7" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">견적 응답 작성</h2>

          <form @submit.prevent="submitQuote" class="space-y-6">
            <!-- 비용 정보 섹션 -->
            <div class="bg-blue-50 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-blue-900 mb-4">비용 정보</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- 입고비 -->
                <div>
                  <div class="flex items-center space-x-2">
                    <label for="inboundFee" class="text-sm font-medium text-gray-700">입고비 (개당)</label>
                    <input
                      id="inboundFee"
                      v-model.number="quoteForm.inboundFee"
                      type="number"
                      min="0"
                      required
                      class="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="예: 5000"
                    />
                    <span class="text-sm text-gray-500">원</span>
                  </div>
                </div>

                <!-- 보관비 -->
                <div>
                  <div class="flex items-center space-x-2">
                    <label for="storageFee" class="text-sm font-medium text-gray-700">보관비 (월, PLT당)</label>
                    <input
                      id="storageFee"
                      v-model.number="quoteForm.storageFee"
                      type="number"
                      min="0"
                      required
                      class="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="예: 15000"
                    />
                    <span class="text-sm text-gray-500">원</span>
                  </div>
                </div>

                <!-- 출고비 -->
                <div>
                  <div class="flex items-center space-x-2">
                    <label for="outboundFee" class="text-sm font-medium text-gray-700">출고비 (개당)</label>
                    <input
                      id="outboundFee"
                      v-model.number="quoteForm.outboundFee"
                      type="number"
                      min="0"
                      required
                      class="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="예: 3000"
                    />
                    <span class="text-sm text-gray-500">원</span>
                  </div>
                </div>

                <!-- WMS 비용 -->
                <div>
                  <div class="flex items-center space-x-2">
                    <label for="wmsFee" class="text-sm font-medium text-gray-700">WMS 비용 (월)</label>
                    <input
                      id="wmsFee"
                      v-model.number="quoteForm.wmsFee"
                      type="number"
                      min="0"
                      required
                      class="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="예: 200000"
                    />
                    <span class="text-sm text-gray-500">원</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 택배 정보 섹션 -->
            <div class="bg-green-50 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-green-900 mb-4">택배 정보</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- 택배비 (극소형) -->
                <div>
                  <div class="flex items-center space-x-2">
                    <label for="courierFeeSmall" class="text-sm font-medium text-gray-700">택배비 (극소형)</label>
                    <input
                      id="courierFeeSmall"
                      v-model.number="quoteForm.courierFeeSmall"
                      type="number"
                      min="0"
                      required
                      class="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="예: 2500"
                    />
                    <span class="text-sm text-gray-500">원</span>
                  </div>
                </div>

                <!-- 택배비 (소형) -->
                <div>
                  <div class="flex items-center space-x-2">
                    <label for="courierFeeMedium" class="text-sm font-medium text-gray-700">택배비 (소형)</label>
                    <input
                      id="courierFeeMedium"
                      v-model.number="quoteForm.courierFeeMedium"
                      type="number"
                      min="0"
                      required
                      class="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="예: 3500"
                    />
                    <span class="text-sm text-gray-500">원</span>
                  </div>
                </div>

                <!-- 택배사 -->
                <div>
                  <label for="courierCompany" class="block text-sm font-medium text-gray-700 mb-2">택배사</label>
                  <input
                    id="courierCompany"
                    v-model="quoteForm.courierCompany"
                    type="text"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="예: CJ대한통운, 한진택배"
                  />
                </div>
              </div>
            </div>

            <!-- 설명 섹션 -->
            <div class="bg-purple-50 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-purple-900 mb-4">상세 정보</h3>
              <div class="space-y-4">
                <!-- 견적 설명 -->
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 mb-2">견적 설명 (선택사항)</label>
                  <textarea
                    id="description"
                    v-model="quoteForm.description"
                    rows="4"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="창고 위치, 시설 현황, 보안 관리, 추가 서비스 등을 설명해주세요."
                  ></textarea>
                </div>

                <!-- 주요 특징 -->
                <div>
                  <label for="keyFeatures" class="block text-sm font-medium text-gray-700 mb-2">주요 특징 (선택사항)</label>
                  <textarea
                    id="keyFeatures"
                    v-model="quoteForm.keyFeatures"
                    rows="3"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="24시간 CCTV, 온도/습도 관리, 화물보험, 실시간 재고관리 등"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- 에러 메시지 -->
            <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span class="block sm:inline">{{ errorMessage }}</span>
            </div>

            <!-- 제출 버튼 -->
            <div class="flex justify-end space-x-4">
              <NuxtLink 
                to="/partner/requests"
                class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </NuxtLink>
              <button
                type="submit"
                :disabled="submitting"
                class="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="submitting" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  제출 중...
                </span>
                <span v-else>견적 제출하기</span>
              </button>
            </div>
          </form>
        </div>

        <!-- 마감된 견적 -->
        <div v-else-if="request && request.currentQuoteCount >= 7" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 text-center">
          <div class="text-6xl mb-4">🔒</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">견적 마감</h2>
          <p class="text-gray-600 mb-6">이 견적은 이미 7개의 견적을 받아 마감되었습니다.</p>
          <NuxtLink 
            to="/partner/requests"
            class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            목록으로 돌아가기
          </NuxtLink>
        </div>

        <!-- 견적을 찾을 수 없는 경우 -->
        <div v-else class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 text-center">
          <div class="text-6xl mb-4">❌</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">견적을 찾을 수 없습니다</h2>
          <p class="text-gray-600 mb-6">요청하신 견적이 존재하지 않거나 접근 권한이 없습니다.</p>
          <NuxtLink 
            to="/partner/requests"
            class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            목록으로 돌아가기
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FirestoreService } from '~/lib/services/firestore'
import type { WarehouseRequest, WarehouseQuote } from '~/lib/types'

// 라우트 파라미터
const route = useRoute()
const requestId = route.params.id as string

// 로그인 체크
const user = useUserStore()

onMounted(async () => {
  console.log('=== 견적 응답 페이지 마운트 시작 ===')
  console.log('요청 ID:', requestId)
  
  // 인증 상태가 준비될 때까지 대기
  let attempts = 0
  const maxAttempts = 50 // 5초 (100ms * 50)
  
  console.log('인증 상태 대기 중...')
  while (!user.authReady && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
    console.log(`인증 대기 시도 ${attempts}/${maxAttempts}`)
  }
  
  console.log('견적 응답 페이지 - 인증 상태:', {
    isLoggedIn: user.isLoggedIn,
    role: user.role,
    authReady: user.authReady,
    currentUser: user.currentUser?.uid,
    userProfile: user.user,
    approvalStatus: user.user?.approvalStatus
  })
  
  if (!user.isLoggedIn) {
    console.log('❌ 로그인되지 않음, 로그인 페이지로 이동')
    navigateTo('/login')
    return
  }
  
  if (user.role !== 'partner') {
    console.log('❌ 파트너가 아님, 로그인 페이지로 이동')
    navigateTo('/login')
    return
  }
  
  // 파트너 승인 상태 확인
  if (user.user?.approvalStatus !== 'approved') {
    console.log('❌ 승인되지 않은 파트너, 대기 페이지로 이동')
    navigateTo('/partner/pending')
    return
  }
  
  console.log('✅ 모든 인증 체크 통과, 견적 신청서 로드 시작')
  loadRequest()
})

const loading = ref(true)
const submitting = ref(false)
const request = ref<WarehouseRequest | null>(null)
const errorMessage = ref('')

// 견적 응답 폼
const quoteForm = ref({
  inboundFee: null, // 입고비(개당)
  storageFee: null, // 보관비(월) (PLT당)
  outboundFee: null, // 출고비(개당)
  courierFeeSmall: null, // 택배비(극소형)
  courierFeeMedium: null, // 택배비(소형)
  courierCompany: '', // 택배사
  wmsFee: null, // WMS 비용
  description: '', // 견적 설명
  keyFeatures: '' // 주요 특징
})

// 견적 신청서 로드
const loadRequest = async () => {
  loading.value = true
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    console.log('견적 신청서 로드 중:', requestId)
    request.value = await firestoreService.getWarehouseRequest(requestId)
    console.log('로드된 견적 신청서:', request.value)
  } catch (error) {
    console.error('견적 신청서 로드 실패:', error)
    errorMessage.value = '견적 신청서를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

// 견적 응답 제출
const submitQuote = async () => {
  submitting.value = true
  errorMessage.value = ''

  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)

    if (!user.currentUser?.uid || !user.user) {
      throw new Error('사용자 정보가 없습니다.')
    }

    const quoteData = {
      requestId: requestId,
      partnerId: user.currentUser.uid,
      partnerName: user.user.name || '',
      partnerCompany: user.user.companyName || '',
      partnerPhone: user.user.phone || '',
      partnerEmail: user.user.email || '',
      inboundFee: quoteForm.value.inboundFee,
      storageFee: quoteForm.value.storageFee,
      outboundFee: quoteForm.value.outboundFee,
      courierFeeSmall: quoteForm.value.courierFeeSmall,
      courierFeeMedium: quoteForm.value.courierFeeMedium,
      courierCompany: quoteForm.value.courierCompany,
      wmsFee: quoteForm.value.wmsFee,
      description: quoteForm.value.description,
      keyFeatures: quoteForm.value.keyFeatures,
      status: 'pending' as const
    }

    console.log('견적 응답 데이터:', quoteData)

    // 견적 응답 저장
    const quoteId = await firestoreService.createWarehouseQuote(quoteData)
    console.log('견적 응답 저장 완료:', quoteId)

    // 견적 신청서의 currentQuoteCount 증가
    if (request.value) {
      await firestoreService.incrementQuoteCount(requestId)
    }

    // 성공 메시지 표시 후 목록으로 이동
    console.log('견적 제출 성공, 목록으로 이동')
    
    // 성공 메시지를 표시하고 잠시 후 이동
    if (confirm('견적이 성공적으로 제출되었습니다! 목록으로 이동하시겠습니까?')) {
      await navigateTo('/partner/requests')
    } else {
      // 사용자가 취소하면 현재 페이지에 머물러 있음
      console.log('사용자가 목록 이동을 취소함')
    }
  } catch (error) {
    console.error('견적 응답 제출 실패:', error)
    errorMessage.value = '견적 제출에 실패했습니다. 다시 시도해주세요.'
  } finally {
    submitting.value = false
  }
}

// 로그아웃 함수
const handleLogout = async () => {
  try {
    await user.logout()
    navigateTo('/')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}

// 날짜 포맷팅
const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 기간 단위 변환
const getPeriodUnit = (unit: string) => {
  const units = {
    'day': '일',
    'month': '개월',
    'year': '년'
  }
  return units[unit] || unit
}

// 상태별 클래스
const getStatusClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'quoted':
      return 'bg-blue-100 text-blue-800'
    case 'accepted':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// 상태 텍스트
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '검토 중'
    case 'quoted':
      return '견적 완료'
    case 'accepted':
      return '수락됨'
    case 'rejected':
      return '거절됨'
    default:
      return '알 수 없음'
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
</style>
