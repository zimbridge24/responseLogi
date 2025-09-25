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
              <NuxtLink to="/admin/partners" class="text-gray-700 hover:text-gray-900">파트너 관리</NuxtLink>
              <NuxtLink to="/admin/approvals" class="text-gray-700 hover:text-gray-900 relative">
                파트너 승인
                <!-- 새로운 승인 요청 알림 점 -->
                <span 
                  v-if="pendingPartnersCount > 0"
                  class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"
                ></span>
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-700">{{ userProfile?.name || '관리자' }}</span>
            <button @click="handleLogout" class="text-gray-700 hover:text-gray-900">로그아웃</button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-8">관리자 대시보드</h2>
      
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card text-center">
          <div v-if="loading" class="text-3xl font-bold text-blue-600 animate-pulse">...</div>
          <div v-else class="text-3xl font-bold text-blue-600">{{ stats.totalRequests }}</div>
          <div class="text-sm text-gray-600">전체 요청</div>
        </div>
        <div class="card text-center">
          <div v-if="loading" class="text-3xl font-bold text-green-600 animate-pulse">...</div>
          <div v-else class="text-3xl font-bold text-green-600">{{ stats.totalBids }}</div>
          <div class="text-sm text-gray-600">전체 견적</div>
        </div>
        <div class="card text-center">
          <div v-if="loading" class="text-3xl font-bold text-yellow-600 animate-pulse">...</div>
          <div v-else class="text-3xl font-bold text-yellow-600">{{ stats.totalPartners }}</div>
          <div class="text-sm text-gray-600">전체 파트너</div>
        </div>
        <div class="card text-center">
          <div v-if="loading" class="text-3xl font-bold text-purple-600 animate-pulse">...</div>
          <div v-else class="text-3xl font-bold text-purple-600">{{ stats.totalCustomers }}</div>
          <div class="text-sm text-gray-600">전체 고객</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">요청 관리</h3>
          <p class="text-gray-600 mb-4">고객들의 견적 요청을 관리하세요</p>
          <NuxtLink to="/admin/requests" class="btn-primary">요청 관리하기</NuxtLink>
        </div>
        
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">견적 관리</h3>
          <p class="text-gray-600 mb-4">파트너들의 견적을 관리하세요</p>
          <NuxtLink to="/admin/bids" class="btn-primary">견적 관리하기</NuxtLink>
        </div>
        
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">파트너 관리</h3>
          <p class="text-gray-600 mb-4">파트너들을 관리하고 승인하세요</p>
          <NuxtLink to="/admin/partners" class="btn-primary">파트너 관리하기</NuxtLink>
        </div>
        
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">파트너 승인</h3>
          <p class="text-gray-600 mb-4">새로운 파트너 가입을 승인하세요</p>
          <NuxtLink to="/admin/approvals" class="btn-primary relative">
            승인 관리하기
            <!-- 새로운 승인 요청 알림 점 -->
            <span 
              v-if="pendingPartnersCount > 0"
              class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"
            ></span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FirestoreService } from '~/lib/services/firestore'

definePageMeta({
  middleware: 'role-admin'
})

const { userProfile, logout } = useUserStore()
const { $db } = useNuxtApp()

// 실제 통계 데이터
const stats = ref({
  totalRequests: 0,
  totalBids: 0,
  totalPartners: 0,
  totalCustomers: 0
})

const loading = ref(true)
const pendingPartnersCount = ref(0)

// 데이터 로드
const loadStats = async () => {
  loading.value = true
  try {
    const firestoreService = new FirestoreService($db)
    
    // 모든 데이터를 병렬로 가져오기
    const [requests, quotes, users] = await Promise.all([
      firestoreService.getWarehouseRequests([]),
      firestoreService.getWarehouseQuotes([]),
      firestoreService.getAllUsers()
    ])
    
    // 파트너와 고객 수 계산
    const partners = users.filter(user => user.role === 'partner')
    const customers = users.filter(user => user.role === 'customer')
    
    // 대기 중인 파트너 수 계산
    const pendingPartners = partners.filter(partner => partner.approvalStatus === 'pending')
    pendingPartnersCount.value = pendingPartners.length
    
    // 통계 업데이트
    stats.value = {
      totalRequests: requests.length,
      totalBids: quotes.length,
      totalPartners: partners.length,
      totalCustomers: customers.length
    }
    
    console.log('관리자 대시보드 통계 로드 완료:', stats.value)
  } catch (error) {
    console.error('통계 데이터 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 로그아웃 처리
const handleLogout = async () => {
  try {
    await logout()
    await navigateTo('/')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>