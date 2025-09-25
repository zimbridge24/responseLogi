<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <NuxtLink to="/admin" class="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">응답하라 창고</NuxtLink>
            <div class="flex space-x-4">
              <NuxtLink to="/admin/requests" class="text-gray-700 hover:text-gray-900">요청 관리</NuxtLink>
              <NuxtLink to="/admin/bids" class="text-blue-600 font-medium">견적 관리</NuxtLink>
              <NuxtLink to="/admin/partners" class="text-gray-700 hover:text-gray-900">파트너 관리</NuxtLink>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-700">{{ userProfile?.name || '관리자' }}</span>
            <button @click="logout" class="text-gray-700 hover:text-gray-900">로그아웃</button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">견적 관리</h2>
        <div class="flex space-x-2">
          <select v-model="selectedStatus" class="form-input">
            <option value="">모든 상태</option>
            <option value="pending">대기중</option>
            <option value="accepted">수락됨</option>
            <option value="rejected">거절됨</option>
            <option value="withdrawn">철회됨</option>
          </select>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ stats.pending }}</div>
          <div class="text-sm text-gray-600">대기중</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.accepted }}</div>
          <div class="text-sm text-gray-600">수락됨</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-red-600">{{ stats.rejected }}</div>
          <div class="text-sm text-gray-600">거절됨</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-gray-600">{{ stats.withdrawn }}</div>
          <div class="text-sm text-gray-600">철회됨</div>
        </div>
      </div>

      <!-- Bids Table -->
      <div class="card">
        <BaseTable
          :data="filteredBids"
          :columns="columns"
          :loading="loading"
          :show-actions="true"
          @edit="viewBid"
        >
          <template #cell-status="{ value }">
            <span
              :class="{
                'text-yellow-600': value === 'pending',
                'text-green-600': value === 'accepted',
                'text-red-600': value === 'rejected',
                'text-gray-600': value === 'withdrawn'
              }"
              class="font-medium"
            >
              {{ getStatusText(value) }}
            </span>
          </template>

          <template #cell-amount="{ value }">
            {{ formatCurrency(value) }}
          </template>

          <template #cell-createdAt="{ value }">
            {{ formatDate(value) }}
          </template>

          <template #actions="{ row }">
            <button
              @click="viewBid(row)"
              class="text-blue-600 hover:text-blue-800 mr-2"
            >
              상세보기
            </button>
            <button
              @click="updateBidStatus(row)"
              class="text-green-600 hover:text-green-800 mr-2"
            >
              상태 변경
            </button>
            <button
              @click="handleDeleteBid(row)"
              class="text-red-600 hover:text-red-800"
            >
              삭제
            </button>
          </template>
        </BaseTable>
      </div>
    </div>

    <!-- Bid Detail Modal -->
    <div
      v-if="selectedBid"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold">견적 상세 정보</h3>
            <button @click="selectedBid = null" class="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="font-medium">요청 ID:</label>
              <p>{{ selectedBid.requestId }}</p>
            </div>
            <div>
              <label class="font-medium">파트너 ID:</label>
              <p>{{ selectedBid.partnerId }}</p>
            </div>
            <div>
              <label class="font-medium">견적 금액:</label>
              <p class="font-bold text-lg">{{ formatCurrency(selectedBid.amount) }}</p>
            </div>
            <div>
              <label class="font-medium">설명:</label>
              <p class="whitespace-pre-wrap">{{ selectedBid.description }}</p>
            </div>
            <div v-if="selectedBid.estimatedDuration">
              <label class="font-medium">예상 기간:</label>
              <p>{{ selectedBid.estimatedDuration }}</p>
            </div>
            <div>
              <label class="font-medium">상태:</label>
              <p class="font-medium">{{ getStatusText(selectedBid.status) }}</p>
            </div>
            <div>
              <label class="font-medium">제출일:</label>
              <p>{{ formatDate(selectedBid.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FirestoreService } from '~/lib/services/firestore'

definePageMeta({
  middleware: 'role-admin'
})

const { userProfile, logout } = useUserStore()
const { $db } = useNuxtApp()

const bids = ref<any[]>([])
const loading = ref(true)
const selectedStatus = ref('')
const selectedBid = ref(null)

const columns = [
  { key: 'partnerName', label: '파트너명' },
  { key: 'customerName', label: '고객명' },
  { key: 'storageFee', label: '보관비', format: 'currency' },
  { key: 'status', label: '상태' },
  { key: 'createdAt', label: '제출일', format: 'date' },
]

const filteredBids = computed(() => {
  if (!selectedStatus.value) return bids.value
  return bids.value.filter(bid => bid.status === selectedStatus.value)
})

const stats = computed(() => {
  return {
    pending: bids.value.filter(bid => bid.status === 'pending').length,
    accepted: bids.value.filter(bid => bid.status === 'accepted').length,
    rejected: bids.value.filter(bid => bid.status === 'rejected').length,
    withdrawn: bids.value.filter(bid => bid.status === 'withdrawn').length,
  }
})

// 데이터 로드
const loadBids = async () => {
  loading.value = true
  try {
    const firestoreService = new FirestoreService($db)
    const allBids = await firestoreService.getWarehouseQuotes([])
    
    // 파트너와 고객 정보 추가
    const bidsWithInfo = []
    for (const bid of allBids) {
      try {
        const [partner, request] = await Promise.all([
          firestoreService.getUser(bid.partnerId),
          firestoreService.getWarehouseRequest(bid.requestId)
        ])
        
        const customer = request ? await firestoreService.getUser(request.customerId) : null
        
        bidsWithInfo.push({
          ...bid,
          partnerName: partner?.name || '알 수 없음',
          customerName: customer?.name || '알 수 없음',
          amount: bid.storageFee // 기존 amount 필드와 호환성을 위해
        })
      } catch (error) {
        console.error('견적 정보 로드 실패:', error)
        bidsWithInfo.push({
          ...bid,
          partnerName: '알 수 없음',
          customerName: '알 수 없음',
          amount: bid.storageFee
        })
      }
    }
    
    bids.value = bidsWithInfo
    console.log('견적 데이터 로드 완료:', bids.value.length)
  } catch (error) {
    console.error('견적 데이터 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadBids()
})

const viewBid = (bid: any) => {
  selectedBid.value = bid
}

const updateBidStatus = async (bid: any) => {
  const newStatus = prompt('새로운 상태를 입력하세요 (pending, accepted, rejected, withdrawn):')
  if (newStatus && ['pending', 'accepted', 'rejected', 'withdrawn'].includes(newStatus)) {
    try {
      await updateBid(bid.id, { status: newStatus })
    } catch (error) {
      console.error('Error updating bid status:', error)
    }
  }
}

const handleDeleteBid = async (bid: any) => {
  if (confirm('정말로 이 견적을 삭제하시겠습니까?')) {
    try {
      await deleteBid(bid.id)
    } catch (error) {
      console.error('Error deleting bid:', error)
    }
  }
}

const getStatusText = (status: string) => {
  const statusMap = {
    pending: '대기중',
    accepted: '수락됨',
    rejected: '거절됨',
    withdrawn: '철회됨'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(value)
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ko-KR')
}
</script>