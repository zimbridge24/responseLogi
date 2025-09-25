<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute top-40 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Navigation -->
    <nav class="relative z-10 flex justify-between items-center px-8 py-6 backdrop-blur-sm bg-white/80 border-b border-white/20">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <span class="text-white text-xl">📦</span>
        </div>
        <span class="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          응답하라 창고
        </span>
      </div>
      <div class="flex items-center space-x-8">
        <div class="text-gray-800 font-semibold text-lg">
          {{ user.user?.name || '사용자' }}님 (파트너)
        </div>
        <div class="w-px h-6 bg-gray-300"></div>
        <NuxtLink 
          to="/" 
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          홈으로
        </NuxtLink>
        <div class="w-px h-6 bg-gray-300"></div>
        <button 
          @click="handleLogout"
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          로그아웃
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="relative z-10 px-8 py-16">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <div class="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <span class="text-6xl">❌</span>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">승인 거절</h1>
          <p class="text-lg text-gray-600 mb-8">
            죄송합니다. 제출하신 서류 검토 결과<br>
            파트너 승인이 거절되었습니다.
          </p>
        </div>

        <!-- Rejection Card -->
        <div class="bg-white rounded-2xl shadow-lg border border-red-200 p-8 mb-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">📋</span>
            </div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">거절 사유</h2>
            <p class="text-gray-600 mb-6">제출하신 서류에 문제가 있어 승인할 수 없습니다.</p>
            
            <div class="bg-red-50 rounded-lg p-6 mb-6">
              <h3 class="text-lg font-semibold text-red-900 mb-3">가능한 거절 사유</h3>
              <ul class="text-red-800 space-y-2 text-sm text-left">
                <li>• 사업자등록증이 유효하지 않거나 만료됨</li>
                <li>• 보험 증권이 유효하지 않거나 보장 범위 부족</li>
                <li>• 창고 사진이 명확하지 않거나 요구사항 미충족</li>
                <li>• 서류의 품질이 낮아 내용 확인이 어려움</li>
                <li>• 기타 서류 요구사항 미충족</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Action Card -->
        <div class="bg-blue-50 rounded-2xl border border-blue-200 p-6 mb-8">
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-blue-600 text-sm">ℹ️</span>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-blue-900 mb-2">다시 신청하기</h3>
              <p class="text-blue-800 text-sm mb-4">
                서류를 다시 준비하여 재신청하실 수 있습니다. 
                정확한 서류를 제출해주시면 다시 검토해드리겠습니다.
              </p>
              <div class="space-y-2 text-sm text-blue-800">
                <p>• 사업자등록증: 유효한 원본 또는 공인사본</p>
                <p>• 보험 증권: 창고 운영에 필요한 보험 가입 증명</p>
                <p>• 창고 사진: 명확하고 전체적인 창고 모습</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="text-center space-y-4">
          <button 
            @click="reapply"
            class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            다시 신청하기
          </button>
          <button 
            @click="contactSupport"
            class="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            고객센터 문의
          </button>
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

// 다시 신청하기
const reapply = () => {
  // 계정 삭제 후 회원가입 페이지로 이동
  if (confirm('다시 신청하시려면 현재 계정을 삭제하고 새로 가입해야 합니다. 계속하시겠습니까?')) {
    // TODO: 계정 삭제 로직 구현
    navigateTo('/register')
  }
}

// 고객센터 문의
const contactSupport = () => {
  // TODO: 고객센터 연락처 표시 또는 문의 페이지로 이동
  alert('고객센터: 1588-0000\n이메일: support@warehouse.com')
}

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
