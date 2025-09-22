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
              <NuxtLink to="/admin/partners" class="text-blue-600 font-medium">파트너 관리</NuxtLink>
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
        <h2 class="text-2xl font-bold text-gray-900">파트너 관리</h2>
        <div class="flex space-x-2">
          <select v-model="selectedStatus" class="form-input">
            <option value="">모든 상태</option>
            <option value="verified">인증됨</option>
            <option value="unverified">미인증</option>
          </select>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card text-center">
          <div class="text-2xl font-bold text-blue-600">{{ stats.total }}</div>
          <div class="text-sm text-gray-600">전체 파트너</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.verified }}</div>
          <div class="text-sm text-gray-600">인증됨</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ stats.unverified }}</div>
          <div class="text-sm text-gray-600">미인증</div>
        </div>
      </div>

      <!-- Partners Table -->
      <div class="card">
        <BaseTable
          :data="filteredPartners"
          :columns="columns"
          :loading="loading"
          :show-actions="true"
          @edit="viewPartner"
        >
          <template #cell-verified="{ value }">
            <span
              :class="{
                'text-green-600': value,
                'text-yellow-600': !value
              }"
              class="font-medium"
            >
              {{ value ? '인증됨' : '미인증' }}
            </span>
          </template>

          <template #cell-createdAt="{ value }">
            {{ formatDate(value) }}
          </template>

          <template #actions="{ row }">
            <button
              @click="viewPartner(row)"
              class="text-blue-600 hover:text-blue-800 mr-2"
            >
              상세보기
            </button>
            <button
              @click="toggleVerification(row)"
              class="text-green-600 hover:text-green-800 mr-2"
            >
              {{ row.verified ? '인증 취소' : '인증' }}
            </button>
            <button
              @click="deletePartner(row)"
              class="text-red-600 hover:text-red-800"
            >
              삭제
            </button>
          </template>
        </BaseTable>
      </div>
    </div>

    <!-- Partner Detail Modal -->
    <div
      v-if="selectedPartner"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold">{{ selectedPartner.name }}</h3>
            <button @click="selectedPartner = null" class="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="font-medium">이메일:</label>
              <p>{{ selectedPartner.email }}</p>
            </div>
            <div v-if="selectedPartner.phone">
              <label class="font-medium">전화번호:</label>
              <p>{{ selectedPartner.phone }}</p>
            </div>
            <div v-if="selectedPartner.company">
              <label class="font-medium">회사:</label>
              <p>{{ selectedPartner.company }}</p>
            </div>
            <div v-if="selectedPartner.description">
              <label class="font-medium">설명:</label>
              <p class="whitespace-pre-wrap">{{ selectedPartner.description }}</p>
            </div>
            <div>
              <label class="font-medium">인증 상태:</label>
              <p class="font-medium">{{ selectedPartner.verified ? '인증됨' : '미인증' }}</p>
            </div>
            <div>
              <label class="font-medium">가입일:</label>
              <p>{{ formatDate(selectedPartner.createdAt) }}</p>
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

// Mock data for partners - in real app, this would come from a store
const partners = ref([
  {
    id: '1',
    name: '홍길동',
    email: 'hong@example.com',
    phone: '010-1234-5678',
    company: 'ABC 개발사',
    description: '웹 개발 전문가',
    verified: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: '김철수',
    email: 'kim@example.com',
    phone: '010-9876-5432',
    company: 'XYZ 디자인',
    description: 'UI/UX 디자이너',
    verified: false,
    createdAt: new Date('2024-02-20')
  }
])

const selectedStatus = ref('')
const selectedPartner = ref(null)
const loading = ref(false)

const columns = [
  { key: 'name', label: '이름' },
  { key: 'email', label: '이메일' },
  { key: 'company', label: '회사' },
  { key: 'verified', label: '인증 상태' },
  { key: 'createdAt', label: '가입일', format: 'date' },
]

const filteredPartners = computed(() => {
  if (!selectedStatus.value) return partners.value
  if (selectedStatus.value === 'verified') {
    return partners.value.filter(partner => partner.verified)
  }
  if (selectedStatus.value === 'unverified') {
    return partners.value.filter(partner => !partner.verified)
  }
  return partners.value
})

const stats = computed(() => {
  return {
    total: partners.value.length,
    verified: partners.value.filter(partner => partner.verified).length,
    unverified: partners.value.filter(partner => !partner.verified).length,
  }
})

const viewPartner = (partner: any) => {
  selectedPartner.value = partner
}

const toggleVerification = async (partner: any) => {
  try {
    // In real app, this would call an API
    partner.verified = !partner.verified
    console.log('Verification toggled for partner:', partner.id)
  } catch (error) {
    console.error('Error toggling verification:', error)
  }
}

const deletePartner = async (partner: any) => {
  if (confirm('정말로 이 파트너를 삭제하시겠습니까?')) {
    try {
      // In real app, this would call an API
      const index = partners.value.findIndex(p => p.id === partner.id)
      if (index > -1) {
        partners.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Error deleting partner:', error)
    }
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ko-KR')
}
</script>





