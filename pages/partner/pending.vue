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
          <div class="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <span class="text-6xl">⏳</span>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">승인 대기 중</h1>
          <p class="text-lg text-gray-600 mb-8">
            관리자가 제출하신 서류를 검토하고 있습니다.<br>
            승인 완료 후 견적 신청서를 확인할 수 있습니다.
          </p>
        </div>

        <!-- Status Card -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">📋</span>
            </div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">제출된 서류</h2>
            <p class="text-gray-600 mb-6">관리자가 다음 서류들을 검토하고 있습니다.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-sm font-medium text-gray-700 mb-1">사업자등록증</div>
                <div class="text-xs text-gray-500">제출 완료</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-sm font-medium text-gray-700 mb-1">보험 증권</div>
                <div class="text-xs text-gray-500">제출 완료</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-sm font-medium text-gray-700 mb-1">창고 사진</div>
                <div class="text-xs text-gray-500">제출 완료</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Information Card -->
        <div class="bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-blue-600 text-sm">ℹ️</span>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-blue-900 mb-2">승인 과정 안내</h3>
              <ul class="text-blue-800 space-y-1 text-sm">
                <li>• 서류 검토는 영업일 기준 1-3일 소요됩니다.</li>
                <li>• 승인 완료 시 이메일로 알림을 드립니다.</li>
                <li>• 추가 서류가 필요한 경우 연락드릴 수 있습니다.</li>
                <li>• 문의사항이 있으시면 고객센터로 연락해주세요.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Refresh Button -->
        <div class="text-center mt-8">
          <button 
            @click="checkApprovalStatus"
            :disabled="loading"
            class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ loading ? '확인 중...' : '승인 상태 확인' }}
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
const loading = ref(false)

// Initialize auth listener
user.initializeAuth()

onMounted(async () => {
  if (!user.isLoggedIn || user.role !== 'partner') {
    navigateTo('/login')
    return
  }
  
  // 이미 승인된 파트너는 요청 페이지로 이동
  if (user.user?.approvalStatus === 'approved') {
    navigateTo('/partner/requests')
    return
  }
})

// 승인 상태 확인
const checkApprovalStatus = async () => {
  loading.value = true
  try {
    // 사용자 프로필 다시 로드
    await user.loadUserProfile()
    
    if (user.user?.approvalStatus === 'approved') {
      // 승인 완료 시 요청 페이지로 이동
      navigateTo('/partner/requests')
    } else if (user.user?.approvalStatus === 'rejected') {
      // 거절된 경우 거절 페이지로 이동
      navigateTo('/partner/rejected')
    } else {
      // 아직 대기 중
      alert('아직 승인 대기 중입니다. 잠시 후 다시 확인해주세요.')
    }
  } catch (error) {
    console.error('승인 상태 확인 실패:', error)
    alert('승인 상태 확인에 실패했습니다. 다시 시도해주세요.')
  } finally {
    loading.value = false
  }
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
