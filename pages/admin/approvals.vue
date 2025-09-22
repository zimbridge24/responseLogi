<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <h1 class="text-xl font-bold text-gray-900">견적 플랫폼</h1>
            <div class="flex space-x-4">
              <NuxtLink to="/admin/requests" class="text-gray-700 hover:text-gray-900">요청 관리</NuxtLink>
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
        <h2 class="text-2xl font-bold text-gray-900">파트너 승인 관리</h2>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ stats.pending }}</div>
          <div class="text-sm text-gray-600">승인 대기</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.approved }}</div>
          <div class="text-sm text-gray-600">승인됨</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-red-600">{{ stats.rejected }}</div>
          <div class="text-sm text-gray-600">거절됨</div>
        </div>
      </div>

      <!-- Pending Approvals Table -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">승인 대기 중인 파트너</h3>
        <BaseTable
          :data="pendingPartners"
          :columns="columns"
          :loading="loading"
          :show-actions="true"
        >
          <template #cell-status="{ value }">
            <span class="text-yellow-600 font-medium">승인 대기</span>
          </template>

          <template #cell-createdAt="{ value }">
            {{ formatDate(value) }}
          </template>

          <template #actions="{ row }">
            <button
              @click="approvePartner(row)"
              class="text-green-600 hover:text-green-800 mr-2"
            >
              승인
            </button>
            <button
              @click="rejectPartner(row)"
              class="text-red-600 hover:text-red-800 mr-2"
            >
              거절
            </button>
            <button
              @click="viewPartner(row)"
              class="text-blue-600 hover:text-blue-800"
            >
              상세보기
            </button>
          </template>
        </BaseTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'role-admin'
})

const { userProfile, logout } = useUserStore()

const loading = ref(false)

const stats = ref({
  pending: 5,
  approved: 18,
  rejected: 2
})

const pendingPartners = ref([
  {
    id: '1',
    name: '홍길동',
    email: 'hong@example.com',
    company: 'ABC 개발사',
    status: 'pending',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: '김철수',
    email: 'kim@example.com',
    company: 'XYZ 디자인',
    status: 'pending',
    createdAt: new Date('2024-02-20')
  }
])

const columns = [
  { key: 'name', label: '이름' },
  { key: 'email', label: '이메일' },
  { key: 'company', label: '회사' },
  { key: 'status', label: '상태' },
  { key: 'createdAt', label: '신청일', format: 'date' },
]

const approvePartner = async (partner: any) => {
  if (confirm('이 파트너를 승인하시겠습니까?')) {
    try {
      // In real app, this would call an API
      console.log('Approving partner:', partner.id)
      // Remove from pending list
      const index = pendingPartners.value.findIndex(p => p.id === partner.id)
      if (index > -1) {
        pendingPartners.value.splice(index, 1)
        stats.value.pending--
        stats.value.approved++
      }
    } catch (error) {
      console.error('Error approving partner:', error)
    }
  }
}

const rejectPartner = async (partner: any) => {
  if (confirm('이 파트너를 거절하시겠습니까?')) {
    try {
      // In real app, this would call an API
      console.log('Rejecting partner:', partner.id)
      // Remove from pending list
      const index = pendingPartners.value.findIndex(p => p.id === partner.id)
      if (index > -1) {
        pendingPartners.value.splice(index, 1)
        stats.value.pending--
        stats.value.rejected++
      }
    } catch (error) {
      console.error('Error rejecting partner:', error)
    }
  }
}

const viewPartner = (partner: any) => {
  // Navigate to partner detail or show modal
  console.log('Viewing partner:', partner)
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ko-KR')
}
</script>





