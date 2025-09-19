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
      <h2 class="text-2xl font-bold text-gray-900 mb-8">관리자 대시보드</h2>
      
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card text-center">
          <div class="text-3xl font-bold text-blue-600">{{ stats.totalRequests }}</div>
          <div class="text-sm text-gray-600">전체 요청</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl font-bold text-green-600">{{ stats.totalBids }}</div>
          <div class="text-sm text-gray-600">전체 견적</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl font-bold text-yellow-600">{{ stats.totalPartners }}</div>
          <div class="text-sm text-gray-600">전체 파트너</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl font-bold text-purple-600">{{ stats.totalCustomers }}</div>
          <div class="text-sm text-gray-600">전체 고객</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'role-admin'
})

const { userProfile, logout } = useUserStore()

// Mock stats data
const stats = ref({
  totalRequests: 156,
  totalBids: 89,
  totalPartners: 23,
  totalCustomers: 45
})
</script>