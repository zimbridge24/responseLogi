<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <BaseNavbar />

    <!-- Main Content -->
    <main class="relative z-10 flex flex-col items-center justify-center flex-1 px-8 py-16">
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 max-w-6xl w-full">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900">신청한 견적 확인</h1>
          <NuxtLink 
            to="/request" 
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <span class="mr-2">➕</span>
            새 견적 신청하기
          </NuxtLink>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">견적 정보를 불러오는 중...</p>
        </div>

        <!-- 견적 목록 -->
        <div v-else-if="requests.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(request, index) in requests" 
            :key="request.id"
            class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-48 flex flex-col"
            @click="selectedRequest = request"
          >
            <!-- 견적 신청 번호 -->
            <div class="text-center mb-4">
              <h3 class="text-xl font-bold text-gray-900">견적 신청 {{ index + 1 }}</h3>
            </div>

            <!-- 기본 정보 -->
            <div class="flex-1 space-y-3">
              <div class="text-center">
                <div class="text-lg font-semibold text-gray-900">
                  팔렛 {{ request.pallets }}개 박스 {{ request.boxes }}개 {{ request.storagePeriod }}{{ getPeriodUnit(request.storagePeriodUnit) }}
                </div>
              </div>
              
              <div class="text-center">
                <div class="text-lg font-semibold text-blue-600">
                  응답 {{ request.currentQuoteCount }}건
                </div>
              </div>
            </div>

            <!-- 상태 표시 및 액션 버튼들 -->
            <div class="mt-4 flex justify-between items-center">
              <!-- 상태 표시 -->
              <span 
                :class="getStatusClass(request.status)"
                class="px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ getStatusText(request.status) }}
              </span>
              
              <!-- 액션 버튼들 -->
              <div class="flex items-center space-x-2">
                <!-- 취소 완료된 경우 휴지통 버튼 -->
                <button 
                  v-if="request.status === 'cancelled'"
                  @click.stop="deleteRequest(request.id, index)"
                  class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                  title="삭제"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
                
                <!-- 대기 중인 경우 취소 버튼 -->
                <button 
                  v-if="request.status === 'pending'"
                  @click.stop="cancelRequest(request.id, index)"
                  class="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 견적이 없는 경우 -->
        <div v-else class="text-center py-16">
          <div class="text-6xl mb-4">📋</div>
          <h3 class="text-2xl font-semibold text-gray-900 mb-2">신청한 견적이 없습니다</h3>
          <p class="text-gray-600 mb-8">첫 번째 견적을 신청해보세요!</p>
          <NuxtLink 
            to="/request" 
            class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <span class="mr-2">🚀</span>
            견적 신청하기
          </NuxtLink>
        </div>
      </div>
    </main>

    <!-- 상세 모달 -->
    <div v-if="selectedRequest" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click="selectedRequest = null">
      <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">견적 신청 상세</h2>
            <button @click="selectedRequest = null" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- 견적 신청 정보 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900">기본 정보</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">팔렛 수</span>
                  <span class="font-semibold">{{ selectedRequest.pallets }}개</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">박스 수</span>
                  <span class="font-semibold">{{ selectedRequest.boxes }}개</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">보관 기간</span>
                  <span class="font-semibold">{{ selectedRequest.storagePeriod }}{{ getPeriodUnit(selectedRequest.storagePeriodUnit) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">선호 위치</span>
                  <span class="font-semibold">{{ selectedRequest.locationPreference || '제한 없음' }}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- 특별 요구사항 -->
          <div v-if="selectedRequest.specialRequirements" class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">특별 요구사항</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-700">{{ selectedRequest.specialRequirements }}</p>
            </div>
          </div>

          <!-- 받은 견적 목록 -->
          <div v-if="selectedRequestQuotes.length > 0">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">받은 견적 ({{ selectedRequestQuotes.length }}개)</h3>
            <div class="space-y-4">
              <div 
                v-for="quote in selectedRequestQuotes" 
                :key="quote.id"
                class="bg-green-50 border border-green-200 rounded-lg p-6"
              >
                <!-- 파트너 정보 -->
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h4 class="font-semibold text-green-900 text-lg">{{ quote.partnerCompany }}</h4>
                    <p class="text-sm text-green-700">{{ quote.partnerName }}</p>
                    <p class="text-xs text-green-600 mt-1">{{ quote.partnerPhone }} | {{ quote.partnerEmail }}</p>
                  </div>
                  <div class="text-right">
                    <div class="text-xs text-green-600 mb-1">견적일: {{ formatDate(quote.createdAt) }}</div>
                    <span :class="getQuoteStatusClass(quote.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ getQuoteStatusText(quote.status) }}
                    </span>
                  </div>
                </div>

                <!-- 비용 정보 -->
                <div class="bg-white rounded-lg p-4 mb-4">
                  <h4 class="font-semibold text-gray-900 mb-3">비용 정보</h4>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div class="text-center">
                      <div class="text-gray-600">입고비</div>
                      <div class="font-semibold text-gray-900">{{ formatPrice(quote.inboundFee) }}원</div>
                      <div class="text-xs text-gray-500">개당</div>
                    </div>
                    <div class="text-center">
                      <div class="text-gray-600">보관비</div>
                      <div class="font-semibold text-gray-900">{{ formatPrice(quote.storageFee) }}원</div>
                      <div class="text-xs text-gray-500">월/PLT</div>
                    </div>
                    <div class="text-center">
                      <div class="text-gray-600">출고비</div>
                      <div class="font-semibold text-gray-900">{{ formatPrice(quote.outboundFee) }}원</div>
                      <div class="text-xs text-gray-500">개당</div>
                    </div>
                    <div class="text-center">
                      <div class="text-gray-600">WMS 비용</div>
                      <div class="font-semibold text-gray-900">{{ formatPrice(quote.wmsFee) }}원</div>
                      <div class="text-xs text-gray-500">월</div>
                    </div>
                  </div>
                </div>

                <!-- 택배 정보 -->
                <div class="bg-white rounded-lg p-4 mb-4">
                  <h4 class="font-semibold text-gray-900 mb-3">택배 정보</h4>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div class="text-center">
                      <div class="text-gray-600">택배비 (극소형)</div>
                      <div class="font-semibold text-gray-900">{{ formatPrice(quote.courierFeeSmall) }}원</div>
                    </div>
                    <div class="text-center">
                      <div class="text-gray-600">택배비 (소형)</div>
                      <div class="font-semibold text-gray-900">{{ formatPrice(quote.courierFeeMedium) }}원</div>
                    </div>
                    <div class="text-center">
                      <div class="text-gray-600">택배사</div>
                      <div class="font-semibold text-gray-900">{{ quote.courierCompany }}</div>
                    </div>
                  </div>
                </div>

                <!-- 견적 설명 -->
                <div class="bg-white rounded-lg p-4 mb-4">
                  <h4 class="font-semibold text-gray-900 mb-2">견적 설명</h4>
                  <p class="text-sm text-gray-700">{{ quote.description }}</p>
                </div>

                <!-- 주요 특징 -->
                <div class="bg-white rounded-lg p-4 mb-4">
                  <h4 class="font-semibold text-gray-900 mb-2">주요 특징</h4>
                  <p class="text-sm text-gray-700">{{ quote.keyFeatures }}</p>
                </div>

                <!-- 액션 버튼 -->
                <div class="flex justify-between items-center">
                  <div class="flex space-x-2">
                    <button 
                      @click="acceptQuote(quote.id)"
                      :disabled="quote.status !== 'pending'"
                      class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      견적 수락
                    </button>
                    <button 
                      @click="deleteQuote(quote.id, quote.partnerName)"
                      :disabled="quote.status !== 'pending'"
                      class="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                    >
                      삭제
                    </button>
                  </div>
                  <button 
                    @click="startChat(quote)"
                    class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <span>💬</span>
                    <span>채팅하기</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 견적이 없는 경우 -->
          <div v-else class="text-center py-8 text-gray-500">
            <div class="text-4xl mb-2">⏳</div>
            <p>아직 견적 응답이 없습니다.</p>
            <p class="text-sm">파트너들이 견적을 검토하고 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { FirestoreService } from '~/lib/services/firestore'
import { where } from 'firebase/firestore'
import type { WarehouseRequest, WarehouseQuote } from '~/lib/types'

// 로그인 체크
const user = useUserStore()

// Initialize auth listener
user.initializeAuth()

const loading = ref(false)
const requests = ref<WarehouseRequest[]>([])
const selectedRequest = ref<WarehouseRequest | null>(null)
const selectedRequestQuotes = ref<WarehouseQuote[]>([])
const unreadChatCount = ref(0)

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

// 견적 목록 로드
const loadRequests = async () => {
  loading.value = true
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    const userId = user.currentUser?.uid
    
    if (userId) {
      const warehouseRequests = await firestoreService.getWarehouseRequestsByCustomer(userId)
      
      // 각 견적 신청에 대한 실제 견적 응답 수를 가져오기
      const requestsWithQuoteCount = await Promise.all(
        (warehouseRequests || []).map(async (request) => {
          try {
            const quotes = await firestoreService.getWarehouseQuotesByRequest(request.id)
            return {
              ...request,
              currentQuoteCount: quotes.length
            }
          } catch (error) {
            console.error(`견적 응답 수 조회 실패 (${request.id}):`, error)
            return request
          }
        })
      )
      
      requests.value = requestsWithQuoteCount
    }
  } catch (error) {
    console.error('견적 목록 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 선택된 견적의 견적 응답들 가져오기
const loadQuotesForSelectedRequest = async () => {
  if (!selectedRequest.value) return
  
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    selectedRequestQuotes.value = await firestoreService.getWarehouseQuotesByRequest(selectedRequest.value.id)
  } catch (error) {
    console.error('견적 응답 로드 실패:', error)
  }
}

// 선택된 견적이 변경될 때 견적 응답들 로드
watch(selectedRequest, () => {
  if (selectedRequest.value) {
    loadQuotesForSelectedRequest()
  }
})

// 사용자 상태 변경 감지
watch(() => user.currentUser, (newUser) => {
  if (newUser && user.role === 'customer') {
    loadRequests()
  }
}, { immediate: true })

onMounted(async () => {
  // 사용자 상태가 로드될 때까지 잠시 대기
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (!user.isLoggedIn) {
    navigateTo('/login')
    return
  }
  if (user.role !== 'customer') {
    navigateTo('/')
    return
  }
  
  // 사용자 인증이 완료되면 견적 목록 로드
  if (user.currentUser?.uid) {
    loadRequests()
    calculateUnreadChatCount()
  }
})

// 로그아웃 함수
const handleLogout = async () => {
  try {
    await user.logout()
    navigateTo('/')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}

// 견적 취소
const cancelRequest = async (requestId: string, index: number) => {
  if (!confirm('견적요청이 취소되고 목록에서 삭제됩니다. 진행 하시겠습니까?')) {
    return
  }
  
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // Firestore에서 상태를 'cancelled'로 업데이트
    await firestoreService.updateWarehouseRequest(requestId, { status: 'cancelled' })
    
    // 로컬 배열에서 상태 업데이트
    requests.value[index].status = 'cancelled'
    
    console.log('견적 신청이 취소되었습니다:', requestId)
  } catch (error) {
    console.error('견적 신청 취소 실패:', error)
    alert('견적 신청 취소에 실패했습니다. 다시 시도해주세요.')
  }
}

// 견적 삭제
const deleteRequest = async (requestId: string, index: number) => {
  if (!confirm('이 견적 신청을 완전히 삭제하시겠습니까?')) {
    return
  }
  
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // Firestore에서 삭제
    await firestoreService.deleteWarehouseRequest(requestId)
    
    // 로컬 배열에서 제거
    requests.value.splice(index, 1)
    
    console.log('견적 신청이 삭제되었습니다:', requestId)
  } catch (error) {
    console.error('견적 신청 삭제 실패:', error)
    alert('견적 신청 삭제에 실패했습니다. 다시 시도해주세요.')
  }
}

// 날짜 포맷팅
const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
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
    case 'cancelled':
      return '취소완료'
    default:
      return '알 수 없음'
  }
}

// 기간 단위
const getPeriodUnit = (unit: string) => {
  switch (unit) {
    case 'day':
      return '일'
    case 'month':
      return '개월'
    case 'year':
      return '년'
    default:
      return ''
  }
}

// 가격 포맷팅
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR').format(price)
}

// 견적 상태별 클래스
const getQuoteStatusClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'accepted':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// 견적 상태 텍스트
const getQuoteStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '검토 중'
    case 'accepted':
      return '수락됨'
    case 'rejected':
      return '거절됨'
    default:
      return '알 수 없음'
  }
}

// 채팅 시작
const startChat = (quote: WarehouseQuote) => {
  // 새로운 공용 채팅 라우트로 이동
  // chatId 형식: requestId_customerId_partnerId
  const chatId = `${quote.requestId}_${user.currentUser?.uid}_${quote.partnerId}`
  const chatUrl = `/chat/${chatId}`
  
  if (process.client) {
    window.location.href = chatUrl
  } else {
    navigateTo(chatUrl)
  }
}

// 견적 수락
const acceptQuote = async (quoteId: string) => {
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // 견적 정보 가져오기
    const quote = selectedRequestQuotes.value.find(q => q.id === quoteId)
    
    if (!quote || !selectedRequest.value) {
      console.error('견적 또는 요청 정보를 찾을 수 없습니다')
      return
    }
    
    // 고객과 파트너 정보 가져오기
    const customer = await firestoreService.getUser(user.currentUser?.uid || '')
    const partner = await firestoreService.getUser(quote.partnerId)
    
    if (!customer || !partner) {
      console.error('고객 또는 파트너 정보를 찾을 수 없습니다')
      return
    }
    
    // 완료된 견적으로 저장
    const completedQuoteData = {
      requestId: selectedRequest.value.id,
      customerId: user.currentUser?.uid || '',
      partnerId: quote.partnerId,
      quoteId: quoteId,
      customerName: customer.name,
      partnerName: partner.name,
      partnerCompany: partner.companyName || '',
      requestTitle: selectedRequest.value.title || '견적 요청',
      pallets: selectedRequest.value.pallets,
      boxes: selectedRequest.value.boxes,
      storagePeriod: selectedRequest.value.storagePeriod,
      storagePeriodUnit: selectedRequest.value.storagePeriodUnit,
      locationPreference: selectedRequest.value.locationPreference || '',
      specialRequirements: selectedRequest.value.specialRequirements || '',
      inboundFee: quote.inboundFee,
      storageFee: quote.storageFee,
      outboundFee: quote.outboundFee,
      wmsFee: quote.wmsFee,
      description: quote.description || '',
      features: quote.features || '',
      acceptedAt: new Date(),
      status: 'active' as const
    }
    
    const completedQuoteId = await firestoreService.createCompletedQuote(completedQuoteData)
    
    // 견적 상태를 수락으로 변경
    await firestoreService.updateWarehouseQuote(quoteId, { status: 'accepted' })
    
    // 견적 신청 상태를 수락으로 변경
    await firestoreService.updateWarehouseRequest(selectedRequest.value.id, { status: 'accepted' })
    
    // 목록 새로고침
    await loadRequests()
    await loadQuotesForSelectedRequest()
    
    alert('견적이 수락되었습니다!')
  } catch (error) {
    console.error('견적 수락 실패:', error)
    alert('견적 수락에 실패했습니다.')
  }
}

// 견적 삭제
const deleteQuote = async (quoteId: string, partnerName: string) => {
  try {
    // 삭제 확인 팝업
    const confirmed = confirm(`${partnerName}업체의 견적서를 목록에서 지우시겠습니까?`)
    
    if (!confirmed) {
      return
    }
    
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // 견적 상태를 거절로 변경 (실제로는 삭제하지만 상태만 변경)
    await firestoreService.updateWarehouseQuote(quoteId, { status: 'rejected' })
    
    // 목록 새로고침
    await loadQuotesForSelectedRequest()
    
    console.log('견적이 삭제되었습니다:', quoteId)
    alert('견적서가 삭제되었습니다.')
  } catch (error) {
    console.error('견적 삭제 실패:', error)
    alert('견적서 삭제에 실패했습니다.')
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