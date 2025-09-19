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
          <span class="text-white text-xl">💬</span>
        </div>
        <span class="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          채팅
        </span>
      </div>
      <div class="flex items-center space-x-8">
        <NuxtLink to="/customer/requests" class="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
          요청 관리
        </NuxtLink>
        <NuxtLink to="/customer/completed-quotes" class="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
          완료된 견적
        </NuxtLink>
        <button @click="handleLogout" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium shadow-lg hover:shadow-xl">
          로그아웃
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="relative z-10 container mx-auto px-8 py-12">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            채팅 관리
          </h1>
          <p class="text-xl text-gray-600">
            파트너와의 실시간 소통을 통해 견적을 논의하세요
          </p>
        </div>

        <!-- Chat List -->
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">진행 중인 채팅</h2>
          
          <!-- Chat List Placeholder -->
          <div class="space-y-4">
            <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold">P</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">파트너 A와의 채팅</h3>
                    <p class="text-gray-600">견적 요청에 대한 상담</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">2시간 전</p>
                  <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">진행중</span>
                </div>
              </div>
            </div>

            <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold">P</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">파트너 B와의 채팅</h3>
                    <p class="text-gray-600">창고 임대 상담</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">1일 전</p>
                  <span class="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">대기중</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="false" class="text-center py-12">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-4xl">💬</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">진행 중인 채팅이 없습니다</h3>
            <p class="text-gray-600 mb-6">새로운 견적 요청을 통해 파트너와 소통을 시작하세요</p>
            <NuxtLink to="/customer/requests" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium">
              요청하기
            </NuxtLink>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NuxtLink to="/customer/requests" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 group">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                <span class="text-2xl">📝</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">새 요청 작성</h3>
                <p class="text-gray-600 text-sm">창고 임대 요청을 작성하세요</p>
              </div>
            </div>
          </NuxtLink>

          <NuxtLink to="/customer/completed-quotes" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 group">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                <span class="text-2xl">✅</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">완료된 견적</h3>
                <p class="text-gray-600 text-sm">완료된 견적을 확인하세요</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 사용자 스토어 사용
const user = useUserStore()

// 로그아웃 함수
const handleLogout = async () => {
  try {
    await user.logout()
    // 로그아웃 후 메인 페이지로 리다이렉트
    await navigateTo('/')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}

// 페이지 메타 설정
useHead({
  title: '채팅 - 응답하라 창고',
  meta: [
    { name: 'description', content: '파트너와의 실시간 채팅을 통해 견적을 논의하세요' }
  ]
})
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
