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
          to="/partner/requests" 
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          견적 신청서
        </NuxtLink>
        <div class="w-px h-6 bg-gray-300"></div>
        <NuxtLink 
          to="/chat-list" 
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          채팅목록
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
          <h1 class="text-4xl font-bold text-gray-900 mb-4">내가 보낸 견적서</h1>
          <p class="text-lg text-gray-600">제출한 견적서들을 확인하고 관리하세요</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="quotes.length === 0" class="text-center py-20">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-4xl text-gray-400">📋</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">아직 제출한 견적서가 없습니다</h3>
          <p class="text-gray-600 mb-8">견적 신청서에 응답하여 견적서를 제출해보세요</p>
          <NuxtLink 
            to="/partner/requests"
            class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            견적 신청서 보기
          </NuxtLink>
        </div>

        <!-- Quotes List -->
        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div 
            v-for="quote in quotes" 
            :key="quote.id"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <!-- Quote Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">
                  {{ quote.requestTitle || '견적 요청' }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ formatDate(quote.createdAt) }}
                </p>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                제출완료
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

            <!-- Quote Description -->
            <div v-if="quote.description" class="mb-4">
              <p class="text-sm text-gray-700 line-clamp-3">{{ quote.description }}</p>
            </div>

            <!-- Actions -->
            <div class="flex space-x-2">
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
            <h2 class="text-2xl font-bold text-gray-900">견적서 상세</h2>
            <button 
              @click="selectedQuote = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <span class="text-2xl">×</span>
            </button>
          </div>

          <!-- Quote Details -->
          <div class="space-y-6">
            <!-- Basic Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">견적 정보</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm text-gray-600">입고비</label>
                  <p class="text-lg font-semibold text-gray-900">{{ formatPrice(selectedQuote.inboundFee) }}원</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">보관비</label>
                  <p class="text-lg font-semibold text-gray-900">{{ formatPrice(selectedQuote.storageFee) }}원</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">출고비</label>
                  <p class="text-lg font-semibold text-gray-900">{{ formatPrice(selectedQuote.outboundFee) }}원</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">WMS</label>
                  <p class="text-lg font-semibold text-gray-900">{{ formatPrice(selectedQuote.wmsFee) }}원</p>
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
                  <span class="font-medium">제출일:</span>
                  {{ formatDate(selectedQuote.createdAt) }}
                </div>
                <div v-if="selectedQuote.updatedAt">
                  <span class="font-medium">수정일:</span>
                  {{ formatDate(selectedQuote.updatedAt) }}
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
import { WarehouseQuote } from '~/lib/types'

// 미들웨어 제거 - 페이지에서 직접 로그인 체크

const user = useUserStore()
const { $db } = useNuxtApp()

const loading = ref(true)
const quotes = ref<WarehouseQuote[]>([])
const selectedQuote = ref<WarehouseQuote | null>(null)

// 페이지 로드
onMounted(async () => {
  if (!user.isLoggedIn || user.role !== 'partner') {
    navigateTo('/login')
    return
  }
  
  // 파트너 승인 상태 확인
  if (user.user?.approvalStatus !== 'approved') {
    // 승인되지 않은 파트너는 대기 페이지로 이동
    navigateTo('/partner/pending')
    return
  }
  
  loadQuotes()
})

// 견적서 로드
const loadQuotes = async () => {
  loading.value = true
  try {
    const { FirestoreService } = await import('~/lib/services/firestore')
    const firestoreService = new FirestoreService($db)
    
    // 파트너가 제출한 견적서들 가져오기
    const partnerQuotes = await firestoreService.getWarehouseQuotesByPartner(user.currentUser?.uid || '')
    
    // 각 견적서에 대한 요청 정보도 함께 가져오기
    const quotesWithRequestInfo = await Promise.all(
      partnerQuotes.map(async (quote) => {
        try {
          const request = await firestoreService.getWarehouseRequest(quote.requestId)
          return {
            ...quote,
            requestTitle: request?.title || '견적 요청'
          }
        } catch (error) {
          console.error('요청 정보 로드 실패:', error)
          return quote
        }
      })
    )
    
    // 최신순으로 정렬
    quotes.value = quotesWithRequestInfo.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    console.log('로드된 견적서들:', quotes.value)
  } catch (error) {
    console.error('견적서 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 견적서 상세보기
const viewQuote = (quote: WarehouseQuote) => {
  selectedQuote.value = quote
}

// 채팅 시작
const startChat = (quote: WarehouseQuote) => {
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
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
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
