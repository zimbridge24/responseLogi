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
        <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <span class="text-white text-xl">📦</span>
            </div>
        <span class="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          응답하라 창고
        </span>
          </div>
      <div class="flex items-center space-x-8">
        <div class="text-gray-800 font-semibold text-lg">
          {{ user.user?.name || '사용자' }}님 (파트너)
          </div>
        <div class="w-px h-6 bg-gray-300"></div>
        <NuxtLink 
          to="/" 
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          홈으로
        </NuxtLink>
        <div class="w-px h-6 bg-gray-300"></div>
        <NuxtLink 
          to="/partner/my-quotes" 
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          내가 보낸 견적서
        </NuxtLink>
        <div class="w-px h-6 bg-gray-300"></div>
        <NuxtLink 
          to="/chat-list" 
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full flex items-center space-x-2"
        >
          <span>채팅목록</span>
          <span v-if="unreadChatCount > 0" class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
            {{ unreadChatCount > 99 ? '99+' : unreadChatCount }}
          </span>
        </NuxtLink>
        <div class="w-px h-6 bg-gray-300"></div>
        <NuxtLink 
          to="/partner/completed-quotes" 
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          확정견적
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
    <main class="relative z-10 px-8 py-16">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">견적 신청서 목록</h1>
          <p class="text-lg text-gray-600">고객들이 신청한 견적 요청을 확인하고 응답하세요</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="requests.length === 0" class="text-center py-20">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-4xl text-gray-400">📋</span>
        </div>
          <h3 class="text-2xl font-semibold text-gray-700 mb-2">들어온 견적이 없습니다</h3>
          <p class="text-gray-500">아직 견적 신청이 없습니다. 잠시 후 다시 확인해주세요.</p>
      </div>

        <!-- Requests List -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="request in requests" 
            :key="request.id"
            class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
            @click="selectedRequest = request"
          >
            <!-- 카드 헤더 -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ request.customerCompany }}</h3>
                <p class="text-sm text-gray-600">{{ request.customerName }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(request.createdAt) }}</p>
              </div>
              <div class="flex flex-col items-end space-y-1">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {{ request.currentQuoteCount }}/7 견적
                </span>
            <span
                  :class="getStatusClass(request.status)"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusText(request.status) }}
            </span>
      </div>
    </div>

            <!-- 기본 정보 미리보기 -->
            <div class="space-y-3 mb-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">팔렛 수</span>
                <span class="font-semibold text-gray-900">{{ request.pallets }}개</span>
          </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">박스 수</span>
                <span class="font-semibold text-gray-900">{{ request.boxes }}개</span>
            </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">보관 기간</span>
                <span class="font-semibold text-gray-900">{{ request.storagePeriod }}{{ getPeriodUnit(request.storagePeriodUnit) }}</span>
            </div>
              <div v-if="request.locationPreference" class="flex justify-between items-center">
                <span class="text-sm text-gray-600">선호 위치</span>
                <span class="font-semibold text-gray-900 text-right">{{ request.locationPreference }}</span>
            </div>
          </div>

            <!-- 특별 요구사항 미리보기 -->
            <div v-if="request.specialRequirements" class="mb-4">
              <div class="text-sm text-gray-600 mb-1">특별 요구사항</div>
              <div class="text-sm text-gray-700 bg-gray-50 rounded-lg p-2 line-clamp-2">
                {{ request.specialRequirements }}
      </div>
    </div>

            <!-- 연락처 정보 -->
            <div class="text-xs text-gray-500 space-y-1">
              <div>{{ request.customerPhone }}</div>
              <div>{{ request.customerEmail }}</div>
            </div>

            <!-- 액션 버튼 -->
            <div class="mt-4">
              <button 
                @click.stop="respondToRequest(request)"
                :disabled="request.currentQuoteCount >= 7"
                class="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {{ request.currentQuoteCount >= 7 ? '마감' : '견적 응답' }}
              </button>
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
import { where } from 'firebase/firestore'
import type { WarehouseRequest } from '~/lib/types'

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
  
  console.log('파트너 요청 목록 페이지 - 인증 상태:', {
    isLoggedIn: user.isLoggedIn,
    role: user.role,
    authReady: user.authReady,
    currentUser: user.currentUser?.uid,
    approvalStatus: user.user?.approvalStatus
  })
  
  if (!user.isLoggedIn || user.role !== 'partner') {
    console.log('로그인되지 않았거나 파트너가 아님, 로그인 페이지로 이동')
    navigateTo('/login')
    return
  }
  
  // 파트너 승인 상태 확인
  if (user.user?.approvalStatus !== 'approved') {
    console.log('승인되지 않은 파트너, 대기 페이지로 이동')
    // 승인되지 않은 파트너는 대기 페이지로 이동
    navigateTo('/partner/pending')
    return
  }
  
  console.log('인증 확인 완료, 데이터 로드 시작')
  loadRequests()
  calculateUnreadChatCount()
})

const requests = ref<WarehouseRequest[]>([])
const loading = ref(true)
const selectedRequest = ref<WarehouseRequest | null>(null)
const unreadChatCount = ref(0)

// 읽지 않은 메시지 수 계산
const calculateUnreadChatCount = async () => {
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // 파트너의 채팅 목록 가져오기
    const userChats = await firestoreService.getChats([
      where('partnerId', '==', user.currentUser?.uid)
    ])
    
    let totalUnreadCount = 0
    
    for (const chat of userChats) {
      try {
        const messages = await firestoreService.getChatMessages(chat.id)
        const currentUserId = user.currentUser?.uid
        
        // 마지막으로 읽은 시간 확인
        const lastReadAt = chat[`lastReadAt_${currentUserId}`]
        
        if (!lastReadAt) {
          // 마지막으로 읽은 시간이 없으면 모든 메시지가 읽지 않은 것으로 간주
          const unreadMessages = messages.filter(msg => msg.senderId !== currentUserId)
          totalUnreadCount += unreadMessages.length
        } else {
          // 마지막으로 읽은 시간 이후의 메시지 중 내가 보내지 않은 메시지 수
          const unreadMessages = messages.filter(msg => {
            if (msg.senderId === currentUserId) return false
            
            const messageTime = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt)
            return messageTime > lastReadAt
          })
          totalUnreadCount += unreadMessages.length
        }
      } catch (error) {
        console.error('채팅 메시지 확인 실패:', error)
      }
    }
    
    unreadChatCount.value = totalUnreadCount
  } catch (error) {
    console.error('읽지 않은 메시지 수 계산 실패:', error)
  }
}

// 견적 신청서 목록 로드
const loadRequests = async () => {
  loading.value = true
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    console.log('=== 파트너 견적 신청서 로드 시작 ===')
    console.log('현재 사용자 역할:', user.role)
    console.log('로그인 상태:', user.isLoggedIn)
    
    // 최대 7개 견적을 받을 수 있는 견적 신청서만 가져오기
    const availableRequests = await firestoreService.getAvailableWarehouseRequests()
    console.log('사용 가능한 견적 신청서:', availableRequests)
    console.log('견적 신청서 수:', availableRequests.length)
    
    // 파트너가 이미 견적을 제출한 요청들 확인
    const quotes = await firestoreService.getWarehouseQuotesByPartner(user.currentUser?.uid || '')
    console.log('파트너가 제출한 견적들:', quotes)
    
    // 견적 제출 여부 맵 생성
    const quotesMap = new Map<string, boolean>()
    quotes.forEach(quote => {
      quotesMap.set(quote.requestId, true)
    })
    
    console.log('견적 제출 여부 맵:', Object.fromEntries(quotesMap))
    
    // 응답완료된 견적 신청서는 목록에서 제외
    const filteredRequests = availableRequests.filter(request => {
      const hasResponded = quotesMap.has(request.id)
      console.log(`견적 신청서 ${request.id}: 응답완료 여부 = ${hasResponded}`)
      return !hasResponded
    })
    
    console.log('필터링 전 견적 신청서 수:', availableRequests.length)
    console.log('필터링 후 견적 신청서 수:', filteredRequests.length)
    
    requests.value = filteredRequests
  } catch (error) {
    console.error('견적 신청서 로드 실패:', error)
    console.error('에러 상세:', error.message)
  } finally {
    loading.value = false
    console.log('=== 파트너 견적 신청서 로드 완료 ===')
  }
}

// 날짜 포맷팅
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
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

// 견적 신청서 상세보기
const viewRequest = (request: WarehouseRequest) => {
  selectedRequest.value = request
}

// 견적 응답
const respondToRequest = (request: WarehouseRequest) => {
  // 견적 응답 페이지로 이동 (나중에 구현)
  navigateTo(`/partner/quote/${request.id}`)
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