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
        <div class="text-gray-800 font-semibold text-lg">
          {{ user.user?.name || '사용자' }}님
        </div>
        <div class="w-px h-6 bg-gray-300"></div>
        <NuxtLink 
          to="/customer/requests" 
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          내 요청
        </NuxtLink>
        <div class="w-px h-6 bg-gray-300"></div>
        <NuxtLink 
          to="/chat-list" 
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full flex items-center space-x-2"
        >
          <span>채팅</span>
          <span v-if="unreadChatCount > 0" class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
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
    <main class="relative z-10 px-8 py-16">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">완료된 견적</h1>
          <p class="text-lg text-gray-600">수락한 견적들을 확인하고 관리하세요</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="completedQuotes.length === 0" class="text-center py-20">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-4xl text-gray-400">✅</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">아직 완료된 견적이 없습니다</h3>
          <p class="text-gray-600 mb-8">견적을 수락하면 여기에 표시됩니다</p>
          <NuxtLink 
            to="/customer/requests"
            class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            내 요청 보기
          </NuxtLink>
        </div>

        <!-- Completed Quotes List -->
        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div 
            v-for="quote in completedQuotes" 
            :key="quote.id"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <!-- Quote Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">
                  {{ quote.requestTitle }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ quote.partnerCompany }} ({{ quote.partnerName }})
                </p>
              </div>
              <span class="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                수락됨
              </span>
            </div>

            <!-- Quote Details -->
            <div class="space-y-3 mb-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">입고비</span>
                <span class="font-semibold text-gray-900">{{ formatPrice(quote.inboundFee) }}원</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">보관비</span>
                <span class="font-semibold text-gray-900">{{ formatPrice(quote.storageFee) }}원</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">출고비</span>
                <span class="font-semibold text-gray-900">{{ formatPrice(quote.outboundFee) }}원</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">WMS</span>
                <span class="font-semibold text-gray-900">{{ formatPrice(quote.wmsFee) }}원</span>
              </div>
            </div>

            <!-- Request Details -->
            <div class="space-y-2 mb-4 text-sm text-gray-600">
              <div class="flex justify-between">
                <span>팔렛 수</span>
                <span class="font-medium">{{ quote.pallets }}개</span>
              </div>
              <div class="flex justify-between">
                <span>박스 수</span>
                <span class="font-medium">{{ quote.boxes }}개</span>
              </div>
              <div class="flex justify-between">
                <span>보관 기간</span>
                <span class="font-medium">{{ quote.storagePeriod }}{{ getPeriodUnit(quote.storagePeriodUnit) }}</span>
              </div>
            </div>

            <!-- Quote Description -->
            <div v-if="quote.description" class="mb-4">
              <p class="text-sm text-gray-700 line-clamp-2">{{ quote.description }}</p>
            </div>

            <!-- Timestamps -->
            <div class="pt-4 border-t border-gray-200">
              <div class="text-xs text-gray-500">
                <div>수락일: {{ formatDate(quote.acceptedAt) }}</div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-2 mt-4">
              <button 
                @click="viewQuote(quote)"
                class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                상세보기
              </button>
              <button 
                @click="startChat(quote)"
                class="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                채팅하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Quote Detail Modal -->
    <div v-if="selectedQuote" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">완료된 견적 상세</h2>
            <button 
              @click="selectedQuote = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <span class="text-2xl">×</span>
            </button>
          </div>

          <!-- Quote Details -->
          <div v-if="selectedQuote" class="space-y-6">
            <!-- Partner Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">파트너 정보</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="font-medium text-gray-900">{{ selectedQuote.partnerCompany || '정보 없음' }}</p>
                <p class="text-sm text-gray-600">{{ selectedQuote.partnerName || '정보 없음' }}</p>
              </div>
            </div>

            <!-- Request Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">요청 정보</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm text-gray-600">팔렛 수</label>
                  <p class="font-semibold text-gray-900">{{ selectedQuote.pallets || 0 }}개</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">박스 수</label>
                  <p class="font-semibold text-gray-900">{{ selectedQuote.boxes || 0 }}개</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">보관 기간</label>
                  <p class="font-semibold text-gray-900">{{ selectedQuote.storagePeriod || 0 }}{{ getPeriodUnit(selectedQuote.storagePeriodUnit) }}</p>
                </div>
                <div v-if="selectedQuote.locationPreference">
                  <label class="text-sm text-gray-600">선호 위치</label>
                  <p class="font-semibold text-gray-900">{{ selectedQuote.locationPreference }}</p>
                </div>
              </div>
            </div>

            <!-- Quote Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">견적 정보</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm text-gray-600">입고비</label>
                  <p class="text-lg font-semibold text-gray-900">{{ formatPrice(selectedQuote.inboundFee || 0) }}원</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">보관비</label>
                  <p class="text-lg font-semibold text-gray-900">{{ formatPrice(selectedQuote.storageFee || 0) }}원</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">출고비</label>
                  <p class="text-lg font-semibold text-gray-900">{{ formatPrice(selectedQuote.outboundFee || 0) }}원</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">WMS</label>
                  <p class="text-lg font-semibold text-gray-900">{{ formatPrice(selectedQuote.wmsFee || 0) }}원</p>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="selectedQuote.description">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">견적 설명</h3>
              <p class="text-gray-700 whitespace-pre-wrap">{{ selectedQuote.description }}</p>
            </div>

            <!-- Features -->
            <div v-if="selectedQuote.features">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">주요 특징</h3>
              <p class="text-gray-700 whitespace-pre-wrap">{{ selectedQuote.features }}</p>
            </div>

            <!-- Timestamps -->
            <div class="pt-4 border-t border-gray-200">
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span class="font-medium">수락일:</span>
                  {{ selectedQuote.acceptedAt ? formatDate(selectedQuote.acceptedAt) : '정보 없음' }}
                </div>
                <div>
                  <span class="font-medium">상태:</span>
                  <span class="text-green-600 font-medium">활성</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button 
              @click="selectedQuote = null"
              class="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
            <button 
              @click="startChat(selectedQuote)"
              class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              채팅하기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FirestoreService } from '~/lib/services/firestore'
import { where } from 'firebase/firestore'

// 로그인 체크
const user = useUserStore()

// Initialize auth listener
user.initializeAuth()

onMounted(async () => {
  if (!user.isLoggedIn || user.role !== 'customer') {
    navigateTo('/login')
    return
  }
  
  loadCompletedQuotes()
  calculateUnreadChatCount()
})

const loading = ref(true)
const completedQuotes = ref<any[]>([])
const selectedQuote = ref<any>(null)
const unreadChatCount = ref(0)

// 완료된 견적 로드
const loadCompletedQuotes = async () => {
  loading.value = true
  try {
    console.log('=== 고객 완료된 견적 로드 시작 ===')
    console.log('현재 사용자 ID:', user.currentUser?.uid)
    
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // 고객의 완료된 견적 가져오기
    const quotes = await firestoreService.getCompletedQuotesByCustomer(user.currentUser?.uid || '')
    console.log('Firestore에서 받은 완료된 견적들:', quotes)
    
    // 최신순으로 정렬
    completedQuotes.value = quotes.sort((a, b) => 
      new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime()
    )
    
    console.log('정렬된 완료된 견적들:', completedQuotes.value)
    console.log('완료된 견적 수:', completedQuotes.value.length)
    console.log('=== 고객 완료된 견적 로드 완료 ===')
  } catch (error) {
    console.error('완료된 견적 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 읽지 않은 메시지 수 계산
const calculateUnreadChatCount = async () => {
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // 고객의 채팅 목록 가져오기
    const userChats = await firestoreService.getChats([
      where('customerId', '==', user.currentUser?.uid)
    ])
    
    let totalUnreadCount = 0
    
    for (const chat of userChats) {
      try {
        const messages = await firestoreService.getChatMessages(chat.id)
        const currentUserId = user.currentUser?.uid
        
        // 내가 보내지 않은 메시지 수 계산
        const unreadMessages = messages.filter(msg => msg.senderId !== currentUserId)
        totalUnreadCount += unreadMessages.length
      } catch (error) {
        console.error('채팅 메시지 확인 실패:', error)
      }
    }
    
    unreadChatCount.value = totalUnreadCount
  } catch (error) {
    console.error('읽지 않은 메시지 수 계산 실패:', error)
  }
}

// 견적 상세보기
const viewQuote = (quote: any) => {
  selectedQuote.value = quote
}

// 채팅 시작
const startChat = (quote: any) => {
  const chatId = `${quote.requestId}_${quote.customerId}_${quote.partnerId}`
  navigateTo(`/chat/${chatId}`)
}

// 가격 포맷팅
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR').format(price)
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
    navigateTo('/')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
</style>
