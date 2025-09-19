<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <h1 class="text-xl font-bold text-gray-900">견적 플랫폼</h1>
            <div class="flex space-x-4">
              <NuxtLink to="/admin/requests" class="text-blue-600 font-medium">요청 관리</NuxtLink>
              <NuxtLink to="/admin/bids" class="text-gray-700 hover:text-gray-900">견적 관리</NuxtLink>
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
        <h2 class="text-2xl font-bold text-gray-900">요청 관리</h2>
        <div class="flex space-x-2">
          <select v-model="selectedStatus" class="form-input">
            <option value="">모든 상태</option>
            <option value="pending">대기중</option>
            <option value="in_progress">진행중</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소됨</option>
          </select>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card text-center">
          <div class="text-2xl font-bold text-blue-600">{{ stats.pending }}</div>
          <div class="text-sm text-gray-600">대기중</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ stats.inProgress }}</div>
          <div class="text-sm text-gray-600">진행중</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.completed }}</div>
          <div class="text-sm text-gray-600">완료</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-red-600">{{ stats.cancelled }}</div>
          <div class="text-sm text-gray-600">취소됨</div>
        </div>
      </div>

      <!-- Requests Table -->
      <div class="card">
        <BaseTable
          :data="filteredRequests"
          :columns="columns"
          :loading="loading"
          :show-actions="true"
          @edit="viewRequest"
        >
          <template #cell-status="{ value }">
            <span
              :class="{
                'text-yellow-600': value === 'pending',
                'text-blue-600': value === 'in_progress',
                'text-green-600': value === 'completed',
                'text-red-600': value === 'cancelled'
              }"
              class="font-medium"
            >
              {{ getStatusText(value) }}
            </span>
          </template>

          <template #cell-budget="{ value }">
            {{ value ? formatCurrency(value) : '-' }}
          </template>

          <template #cell-createdAt="{ value }">
            {{ formatDate(value) }}
          </template>

          <template #actions="{ row }">
            <button
              @click="viewRequest(row)"
              class="text-blue-600 hover:text-blue-800 mr-2"
            >
              상세보기
            </button>
            <button
              @click="updateRequestStatus(row)"
              class="text-green-600 hover:text-green-800 mr-2"
            >
              상태 변경
            </button>
            <button
              @click="handleDeleteRequest(row)"
              class="text-red-600 hover:text-red-800"
            >
              삭제
            </button>
          </template>
        </BaseTable>
      </div>
    </div>

    <!-- Request Detail Modal -->
    <div
      v-if="selectedRequest"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold">{{ selectedRequest.title }}</h3>
            <button @click="selectedRequest = null" class="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="font-medium">고객 ID:</label>
              <p>{{ selectedRequest.customerId }}</p>
            </div>
            <div>
              <label class="font-medium">카테고리:</label>
              <p>{{ selectedRequest.category }}</p>
            </div>
            <div>
              <label class="font-medium">설명:</label>
              <p class="whitespace-pre-wrap">{{ selectedRequest.description }}</p>
            </div>
            <div v-if="selectedRequest.budget">
              <label class="font-medium">예산:</label>
              <p>{{ formatCurrency(selectedRequest.budget) }}</p>
            </div>
            <div v-if="selectedRequest.deadline">
              <label class="font-medium">마감일:</label>
              <p>{{ formatDate(selectedRequest.deadline) }}</p>
            </div>
            <div v-if="selectedRequest.location">
              <label class="font-medium">위치:</label>
              <p>{{ selectedRequest.location }}</p>
            </div>
            <div>
              <label class="font-medium">상태:</label>
              <p class="font-medium">{{ getStatusText(selectedRequest.status) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'role-admin'
})

const { userProfile, logout } = useUserStore()
const { requests, loading, fetchAllRequests, updateRequest, deleteRequest } = useRequestsStore()

const selectedStatus = ref('')
const selectedRequest = ref(null)

const columns = [
  { key: 'title', label: '제목' },
  { key: 'customerId', label: '고객 ID' },
  { key: 'category', label: '카테고리' },
  { key: 'budget', label: '예산', format: 'currency' },
  { key: 'status', label: '상태' },
  { key: 'createdAt', label: '생성일', format: 'date' },
]

const filteredRequests = computed(() => {
  if (!selectedStatus.value) return requests
  return requests.filter(req => req.status === selectedStatus.value)
})

const stats = computed(() => {
  return {
    pending: requests.filter(req => req.status === 'pending').length,
    inProgress: requests.filter(req => req.status === 'in_progress').length,
    completed: requests.filter(req => req.status === 'completed').length,
    cancelled: requests.filter(req => req.status === 'cancelled').length,
  }
})

onMounted(async () => {
  await fetchAllRequests()
})

const viewRequest = (request: any) => {
  selectedRequest.value = request
}

const updateRequestStatus = async (request: any) => {
  const newStatus = prompt('새로운 상태를 입력하세요 (pending, in_progress, completed, cancelled):')
  if (newStatus && ['pending', 'in_progress', 'completed', 'cancelled'].includes(newStatus)) {
    try {
      await updateRequest(request.id, { status: newStatus })
    } catch (error) {
      console.error('Error updating request status:', error)
    }
  }
}

const handleDeleteRequest = async (request: any) => {
  if (confirm('정말로 이 요청을 삭제하시겠습니까?')) {
    try {
      await deleteRequest(request.id)
    } catch (error) {
      console.error('Error deleting request:', error)
    }
  }
}

const getStatusText = (status: string) => {
  const statusMap = {
    pending: '대기중',
    in_progress: '진행중',
    completed: '완료',
    cancelled: '취소됨'
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