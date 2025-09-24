<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
    <!-- Navigation -->
    <nav class="relative z-10 flex justify-between items-center px-8 py-6 backdrop-blur-sm bg-white/80 border-b border-white/20">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
          <span class="text-white text-xl">🏢</span>
        </div>
        <span class="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          파트너 허브
        </span>
      </div>
      <div class="flex items-center space-x-8">
        <div class="text-gray-800 font-semibold text-lg">
          {{ user.user?.name || '파트너' }}님
        </div>
        <div class="w-px h-6 bg-gray-300"></div>
        <NuxtLink 
          to="/partner/requests" 
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          견적 신청서
        </NuxtLink>
        <div class="w-px h-6 bg-gray-300"></div>
        <NuxtLink 
          to="/partner/my-quotes" 
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          내 견적 관리
        </NuxtLink>
        <div class="w-px h-6 bg-gray-300"></div>
        <NuxtLink 
          to="/chat-list" 
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full flex items-center"
        >
          채팅
          <span v-if="unreadChatCount > 0" class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
            {{ unreadChatCount > 99 ? '99+' : unreadChatCount }}
          </span>
        </NuxtLink>
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
    <main class="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center px-8">
      <!-- Hero Section -->
      <div class="mb-20 max-w-4xl">
        <div class="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-8 animate-fade-in">
          🏢 파트너 전용 대시보드
        </div>
        <h1 class="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight animate-slide-up">
          <span class="bg-gradient-to-r from-green-600 via-teal-600 to-green-800 bg-clip-text text-transparent">
            파트너 허브
          </span>
        </h1>
        <p class="text-2xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
          새로운 견적 기회를 찾고, 수익을 창출하세요
        </p>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-bounce-in">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 rounded-xl">
                <span class="text-2xl">📋</span>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">사용 가능한 견적</p>
                <p class="text-2xl font-bold text-gray-900">{{ availableRequests }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div class="flex items-center">
              <div class="p-3 bg-green-100 rounded-xl">
                <span class="text-2xl">💼</span>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">내가 작성한 견적</p>
                <p class="text-2xl font-bold text-gray-900">{{ myQuotes }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div class="flex items-center">
              <div class="p-3 bg-purple-100 rounded-xl">
                <span class="text-2xl">✅</span>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">수락된 견적</p>
                <p class="text-2xl font-bold text-gray-900">{{ acceptedQuotes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center animate-bounce-in mb-12">
          <NuxtLink 
            to="/partner/my-quotes" 
            class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            <span class="relative z-10 flex items-center space-x-2">
              <span>💼</span>
              <span>내 견적 관리</span>
            </span>
            <div class="absolute inset-0 bg-gradient-to-r from-green-700 to-teal-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </NuxtLink>
        </div>

        <!-- 견적 신청서 목록 -->
        <div class="w-full max-w-6xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-3xl font-bold text-gray-900">사용 가능한 견적 신청서</h2>
            <div class="text-sm text-gray-600">
              총 {{ availableRequests }}건의 견적 신청이 있습니다
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center h-48">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>

          <!-- Empty State -->
          <div v-else-if="requests.length === 0" class="text-center py-12 text-gray-500">
            <div class="text-6xl mb-4">📋</div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">사용 가능한 견적 신청이 없습니다</h3>
            <p class="text-gray-500">새로운 견적 신청이 있으면 여기에 표시됩니다.</p>
          </div>

          <!-- Requests Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="(request, index) in requests" 
              :key="request.id"
              @click="viewRequest(request)"
              class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span class="text-white text-xl font-bold">{{ index + 1 }}</span>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      견적 {{ index + 1 }}
                    </h3>
                    <p class="text-sm text-gray-500">{{ formatDate(request.createdAt) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    신규
                  </span>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <span class="text-blue-500">📦</span>
                  <span class="text-sm text-gray-600">팔렛 {{ request.pallets || 0 }}개</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-green-500">📋</span>
                  <span class="text-sm text-gray-600">박스 {{ request.boxes || 0 }}개</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-purple-500">⏰</span>
                  <span class="text-sm text-gray-600">보관 {{ request.storagePeriod || 0 }}{{ getPeriodUnit(request.storagePeriodUnit) }}</span>
                </div>
              </div>

              <div class="mt-4 pt-4 border-t border-gray-200">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">상세보기</span>
                  <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FirestoreService } from '~/lib/services/firestore'

definePageMeta({
  middleware: 'role-partner'
})

const user = useUserStore()
const { $db } = useNuxtApp()

// 통계 데이터
const availableRequests = ref(0)
const myQuotes = ref(0)
const acceptedQuotes = ref(0)
const unreadChatCount = ref(0)
const requests = ref<any[]>([])
const loading = ref(false)

// 데이터 로드
const loadData = async () => {
  loading.value = true
  try {
    const firestoreService = new FirestoreService($db)
    
    // 사용 가능한 견적 요청 목록
    const allRequests = await firestoreService.getAllRequests()
    requests.value = allRequests
    availableRequests.value = allRequests.length
    
    // 내가 작성한 견적 수
    const myBids = await firestoreService.getBidsByPartner(user.currentUser?.uid || '')
    myQuotes.value = myBids.length
    
    // 수락된 견적 수
    const acceptedBids = myBids.filter(bid => bid.status === 'accepted')
    acceptedQuotes.value = acceptedBids.length
    
    console.log('파트너 대시보드 데이터 로드 완료:', {
      availableRequests: availableRequests.value,
      myQuotes: myQuotes.value,
      acceptedQuotes: acceptedQuotes.value,
      requests: requests.value.length
    })
  } catch (error) {
    console.error('데이터 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 채팅 미읽음 수 계산
const calculateUnreadChatCount = async () => {
  try {
    // 채팅 관련 로직은 나중에 구현
    unreadChatCount.value = 0
  } catch (error) {
    console.error('채팅 수 계산 실패:', error)
  }
}

// 견적 신청서 상세보기
const viewRequest = (request: any) => {
  // 견적 신청서 상세 페이지로 이동
  navigateTo(`/partner/request-${request.id}`)
}

// 날짜 포맷팅
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

// 기간 단위 변환
const getPeriodUnit = (unit: string) => {
  if (!unit) return ''
  const units = {
    'day': '일',
    'month': '개월',
    'year': '년'
  }
  return units[unit] || unit
}

// 로그아웃
const handleLogout = async () => {
  try {
    await user.logout()
    await navigateTo('/')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}

onMounted(() => {
  loadData()
  calculateUnreadChatCount()
})
</script>

<style scoped>
/* 애니메이션 스타일 */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes bounce-in {
  0% { 
    opacity: 0; 
    transform: scale(0.3); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.05); 
  }
  70% { 
    transform: scale(0.9); 
  }
  100% { 
    opacity: 1; 
    transform: scale(1); 
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.8s ease-out;
}

.animate-fade-in-delay {
  animation: fade-in 0.6s ease-out 0.2s both;
}

.animate-bounce-in {
  animation: bounce-in 0.6s ease-out 0.4s both;
}
</style>