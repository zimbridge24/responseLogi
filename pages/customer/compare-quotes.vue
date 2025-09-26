<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <BaseNavbar />

    <!-- Main Content -->
    <main class="relative z-10 px-8 py-16">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">견적 비교하기</h1>
            <p class="text-gray-600">받은 견적들을 한눈에 비교해보세요</p>
          </div>
          <NuxtLink 
            to="/customer/requests" 
            class="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all duration-200"
          >
            ← 목록으로 돌아가기
          </NuxtLink>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">견적 정보를 불러오는 중...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="quotes.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📊</div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">비교할 견적이 없습니다</h3>
          <p class="text-gray-500">견적 신청을 하고 파트너들의 응답을 기다려보세요.</p>
        </div>

        <!-- Comparison Table -->
        <div v-else class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">업체명</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">보관료<br>(월)</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">팔렛료<br>(월)</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">박스료<br>(월)</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">출고비<br>(소형)</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">출고비<br>(중형)</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">택배사</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">WMS<br>수수료</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">총 예상<br>비용</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">견적일</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">상태</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">액션</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr 
                  v-for="quote in quotes" 
                  :key="quote.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <!-- 업체명 -->
                  <td class="px-6 py-4">
                    <div class="font-semibold text-gray-900">{{ quote.partnerCompany }}</div>
                  </td>
                  
                  <!-- 보관료 -->
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">{{ formatPrice(quote.storageFee) }}원</div>
                  </td>
                  
                  <!-- 팔렛료 -->
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">{{ formatPrice(quote.palletFee) }}원</div>
                  </td>
                  
                  <!-- 박스료 -->
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">{{ formatPrice(quote.boxFee) }}원</div>
                  </td>
                  
                  <!-- 출고비 (소형) -->
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">{{ formatPrice(quote.courierFeeSmall) }}원</div>
                  </td>
                  
                  <!-- 출고비 (중형) -->
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">{{ formatPrice(quote.courierFeeMedium) }}원</div>
                  </td>
                  
                  <!-- 택배사 -->
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">{{ quote.courierCompany || '-' }}</div>
                  </td>
                  
                  <!-- WMS 수수료 -->
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">{{ formatPrice(quote.wmsFee) }}원</div>
                  </td>
                  
                  <!-- 총 예상 비용 -->
                  <td class="px-6 py-4">
                    <div class="font-semibold text-blue-600">{{ formatPrice(calculateTotalCost(quote)) }}원</div>
                  </td>
                  
                  <!-- 견적일 -->
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-500">{{ formatDate(quote.createdAt) }}</div>
                  </td>
                  
                  <!-- 상태 -->
                  <td class="px-6 py-4">
                    <span :class="getQuoteStatusClass(quote.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ getQuoteStatusText(quote.status) }}
                    </span>
                  </td>
                  
                  <!-- 액션 -->
                  <td class="px-6 py-4">
                    <div class="flex space-x-2">
                      <button 
                        v-if="quote.status === 'pending'"
                        @click="acceptQuote(quote.id)"
                        class="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                      >
                        수락
                      </button>
                      <button 
                        @click="startChat(quote)"
                        class="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        채팅
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Summary Cards -->
        <div v-if="quotes.length > 0" class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 최저가 견적 -->
          <div class="bg-green-50 border border-green-200 rounded-xl p-6">
            <div class="flex items-center mb-2">
              <span class="text-green-600 text-2xl mr-2">💰</span>
              <h3 class="text-lg font-semibold text-green-900">최저가 견적</h3>
            </div>
            <div class="text-2xl font-bold text-green-600">{{ formatPrice(lowestPrice) }}원</div>
            <div class="text-sm text-green-700 mt-1">{{ lowestPriceCompany }}</div>
          </div>

          <!-- 평균가격 -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div class="flex items-center mb-2">
              <span class="text-blue-600 text-2xl mr-2">📊</span>
              <h3 class="text-lg font-semibold text-blue-900">평균 견적가</h3>
            </div>
            <div class="text-2xl font-bold text-blue-600">{{ formatPrice(averagePrice) }}원</div>
            <div class="text-sm text-blue-700 mt-1">총 {{ quotes.length }}개 견적</div>
          </div>

          <!-- 최고가 견적 -->
          <div class="bg-red-50 border border-red-200 rounded-xl p-6">
            <div class="flex items-center mb-2">
              <span class="text-red-600 text-2xl mr-2">📈</span>
              <h3 class="text-lg font-semibold text-red-900">최고가 견적</h3>
            </div>
            <div class="text-2xl font-bold text-red-600">{{ formatPrice(highestPrice) }}원</div>
            <div class="text-sm text-red-700 mt-1">{{ highestPriceCompany }}</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '~/stores/user'
import { FirestoreService } from '~/lib/services/firestore'

const user = useUserStore()

const loading = ref(true)
const quotes = ref<any[]>([])
const requestId = ref('')

// URL에서 requestId 가져오기
onMounted(async () => {
  const route = useRoute()
  requestId.value = route.query.requestId as string
  
  if (requestId.value) {
    await loadQuotes()
  }
  loading.value = false
})

// 견적 목록 로드
const loadQuotes = async () => {
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    const quotesData = await firestoreService.getWarehouseQuotesByRequest(requestId.value)
    quotes.value = quotesData || []
  } catch (error) {
    console.error('견적 목록 로드 실패:', error)
  }
}

// 총 비용 계산
const calculateTotalCost = (quote: any) => {
  const storageFee = quote.storageFee || 0
  const palletFee = quote.palletFee || 0
  const boxFee = quote.boxFee || 0
  const wmsFee = quote.wmsFee || 0
  
  return storageFee + palletFee + boxFee + wmsFee
}

// 가격 포맷팅
const formatPrice = (price: number) => {
  if (!price) return '0'
  return price.toLocaleString()
}

// 날짜 포맷팅
const formatDate = (date: any) => {
  if (!date) return '-'
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('ko-KR')
}

// 견적 상태 클래스
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
      return '대기중'
    case 'accepted':
      return '수락됨'
    case 'rejected':
      return '거절됨'
    default:
      return '알 수 없음'
  }
}

// 통계 계산
const lowestPrice = computed(() => {
  if (quotes.value.length === 0) return 0
  return Math.min(...quotes.value.map(quote => calculateTotalCost(quote)))
})

const highestPrice = computed(() => {
  if (quotes.value.length === 0) return 0
  return Math.max(...quotes.value.map(quote => calculateTotalCost(quote)))
})

const averagePrice = computed(() => {
  if (quotes.value.length === 0) return 0
  const total = quotes.value.reduce((sum, quote) => sum + calculateTotalCost(quote), 0)
  return Math.round(total / quotes.value.length)
})

const lowestPriceCompany = computed(() => {
  if (quotes.value.length === 0) return '-'
  const lowestQuote = quotes.value.find(quote => calculateTotalCost(quote) === lowestPrice.value)
  return lowestQuote?.partnerCompany || '-'
})

const highestPriceCompany = computed(() => {
  if (quotes.value.length === 0) return '-'
  const highestQuote = quotes.value.find(quote => calculateTotalCost(quote) === highestPrice.value)
  return highestQuote?.partnerCompany || '-'
})

// 견적 수락
const acceptQuote = async (quoteId: string) => {
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // 견적 수락 로직 (기존 requests.vue의 acceptQuote 함수와 동일)
    const quote = quotes.value.find(q => q.id === quoteId)
    if (!quote) return

    const confirmed = confirm(`${quote.partnerCompany}의 견적을 수락하시겠습니까?`)
    if (!confirmed) return

    // 완료된 견적으로 저장
    const completedQuoteData = {
      requestId: requestId.value,
      customerId: user.currentUser?.uid || '',
      partnerId: quote.partnerId,
      quoteId: quoteId,
      customerName: user.profile?.name || '',
      partnerName: quote.partnerName,
      partnerCompany: quote.partnerCompany,
      requestTitle: '견적 요청',
      pallets: quote.pallets || 0,
      boxes: quote.boxes || 0,
      storagePeriod: quote.storagePeriod || 0,
      storagePeriodUnit: quote.storagePeriodUnit || 'month',
      storageFee: quote.storageFee,
      palletFee: quote.palletFee,
      boxFee: quote.boxFee,
      courierFeeSmall: quote.courierFeeSmall,
      courierFeeMedium: quote.courierFeeMedium,
      courierCompany: quote.courierCompany,
      wmsFee: quote.wmsFee,
      description: quote.description || '',
      features: quote.features || '',
      acceptedAt: new Date(),
      status: 'active' as const
    }
    
    await firestoreService.createCompletedQuote(completedQuoteData)
    await firestoreService.updateWarehouseQuote(quoteId, { status: 'accepted' })
    await firestoreService.updateWarehouseRequest(requestId.value, { status: 'accepted' })
    
    // 목록 새로고침
    await loadQuotes()
    
    alert('견적이 수락되었습니다!')
  } catch (error) {
    console.error('견적 수락 실패:', error)
    alert('견적 수락에 실패했습니다.')
  }
}

// 채팅 시작
const startChat = (quote: any) => {
  const chatId = `${requestId.value}_${user.currentUser?.uid}_${quote.partnerId}`
  const chatUrl = `/chat/${chatId}`
  
  if (process.client) {
    window.location.href = chatUrl
  } else {
    navigateTo(chatUrl)
  }
}
</script>
