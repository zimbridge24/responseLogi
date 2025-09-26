<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center">
    <!-- Navigation -->
    <nav class="absolute top-0 left-0 right-0 flex justify-end items-center px-8 py-6">
      <button 
        @click="handleLogout"
        class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200"
      >
        LogOut
      </button>
    </nav>

    <!-- Main Content -->
    <main class="text-center px-8">
      <div class="max-w-2xl mx-auto">
        <div class="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <span class="text-6xl">❌</span>
        </div>
        
        <h1 class="text-4xl font-bold text-gray-900 mb-8">승인이 거절되었습니다.</h1>
        
        <div v-if="user.userProfile?.rejectionReason" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h3 class="text-lg font-semibold text-red-800 mb-2">거절사유:</h3>
          <p class="text-red-700 text-lg">{{ user.userProfile.rejectionReason }}</p>
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p class="text-blue-800 text-lg">
            추가로 궁금하신 점이 있으면 고객센터로 문의해주세요.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 로그인 체크
const user = useUserStore()

// Initialize auth listener
user.initializeAuth()

onMounted(async () => {
  if (!user.isLoggedIn || user.role !== 'partner') {
    navigateTo('/login')
    return
  }
  
  // 승인된 파트너는 요청 페이지로 이동
  if (user.user?.approvalStatus === 'approved') {
    navigateTo('/')
    return
  }
  
  // 대기 중인 파트너는 대기 페이지로 이동
  if (user.user?.approvalStatus === 'pending') {
    navigateTo('/partner/pending')
    return
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
