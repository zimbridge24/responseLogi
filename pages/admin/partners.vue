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
            <option value="verified">승인됨</option>
            <option value="unverified">미승인</option>
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
          <div class="text-sm text-gray-600">승인됨</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ stats.unverified }}</div>
          <div class="text-sm text-gray-600">미승인</div>
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
          <template #cell-approvalStatus="{ value }">
            <span
              :class="{
                'text-green-600': value === 'approved',
                'text-yellow-600': value === 'pending',
                'text-red-600': value === 'rejected'
              }"
              class="font-medium"
            >
              {{ value === 'approved' ? '승인됨' : value === 'pending' ? '대기중' : '거절됨' }}
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
              {{ row.approvalStatus === 'approved' ? '승인 취소' : '승인' }}
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
              <label class="font-medium">승인 상태:</label>
              <p class="font-medium">
                <span
                  :class="{
                    'text-green-600': selectedPartner.approvalStatus === 'approved',
                    'text-yellow-600': selectedPartner.approvalStatus === 'pending',
                    'text-red-600': selectedPartner.approvalStatus === 'rejected'
                  }"
                >
                  {{ selectedPartner.approvalStatus === 'approved' ? '승인됨' : 
                     selectedPartner.approvalStatus === 'pending' ? '대기중' : '거절됨' }}
                </span>
              </p>
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
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'role-admin'
})

const { userProfile, logout } = useUserStore()

const partners = ref<any[]>([])
const selectedStatus = ref('')
const selectedPartner = ref(null)
const loading = ref(false)

// 실제 Firestore에서 파트너 데이터 가져오기
const loadPartners = async () => {
  loading.value = true
  try {
    const { $db } = useNuxtApp()
    const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore')
    
    // role이 'partner'인 모든 사용자 가져오기
    const q = query(
      collection($db, 'users'),
      where('role', '==', 'partner'),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const partnersList: any[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      partnersList.push({
        id: doc.id,
        name: data.name,
        email: data.email || '이메일 없음',
        phone: data.phone,
        company: data.companyName,
        description: data.description || '',
        verified: data.approvalStatus === 'approved',
        approvalStatus: data.approvalStatus,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
      })
    })
    
    partners.value = partnersList
    console.log('파트너 목록 로드 완료:', partnersList)
    
  } catch (error) {
    console.error('파트너 목록 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

const columns = [
  { key: 'name', label: '이름' },
  { key: 'email', label: '이메일' },
  { key: 'company', label: '회사' },
  { key: 'phone', label: '전화번호' },
  { key: 'approvalStatus', label: '승인 상태' },
  { key: 'createdAt', label: '가입일', format: 'date' },
]

const filteredPartners = computed(() => {
  if (!selectedStatus.value) return partners.value
  if (selectedStatus.value === 'verified') {
    return partners.value.filter(partner => partner.approvalStatus === 'approved')
  }
  if (selectedStatus.value === 'unverified') {
    return partners.value.filter(partner => partner.approvalStatus !== 'approved')
  }
  return partners.value
})

const stats = computed(() => {
  return {
    total: partners.value.length,
    verified: partners.value.filter(partner => partner.approvalStatus === 'approved').length,
    unverified: partners.value.filter(partner => partner.approvalStatus !== 'approved').length,
  }
})

const viewPartner = (partner: any) => {
  selectedPartner.value = partner
}

const toggleVerification = async (partner: any) => {
  try {
    const { $db } = useNuxtApp()
    const { doc, updateDoc } = await import('firebase/firestore')
    
    const newStatus = partner.approvalStatus === 'approved' ? 'pending' : 'approved'
    
    await updateDoc(doc($db, 'users', partner.id), {
      approvalStatus: newStatus,
      updatedAt: new Date()
    })
    
    // 로컬 데이터 업데이트
    partner.approvalStatus = newStatus
    partner.verified = newStatus === 'approved'
    
    console.log('파트너 승인 상태 변경:', partner.id, newStatus)
    alert(`파트너가 ${newStatus === 'approved' ? '승인' : '대기'}되었습니다.`)
  } catch (error) {
    console.error('승인 상태 변경 실패:', error)
    alert('승인 상태 변경에 실패했습니다.')
  }
}

const deletePartner = async (partner: any) => {
  if (confirm('정말로 이 파트너를 삭제하시겠습니까?')) {
    try {
      const { $db } = useNuxtApp()
      const { doc, deleteDoc } = await import('firebase/firestore')
      
      await deleteDoc(doc($db, 'users', partner.id))
      
      // 로컬 데이터에서 제거
      const index = partners.value.findIndex(p => p.id === partner.id)
      if (index > -1) {
        partners.value.splice(index, 1)
      }
      
      console.log('파트너 삭제 완료:', partner.id)
      alert('파트너가 삭제되었습니다.')
    } catch (error) {
      console.error('파트너 삭제 실패:', error)
      alert('파트너 삭제에 실패했습니다.')
    }
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ko-KR')
}

// 페이지 로드 시 파트너 목록 가져오기
onMounted(() => {
  loadPartners()
})
</script>





