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
        <!-- 로그인되지 않은 경우 -->
        <template v-if="!user.isLoggedIn">
          <div class="flex items-center space-x-4">
            <div class="relative group">
              <button class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200">
                로그인
              </button>
              <div class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <NuxtLink 
                  to="/customer/login" 
                  class="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors"
                >
                  고객 로그인
                </NuxtLink>
                <NuxtLink 
                  to="/login" 
                  class="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors"
                >
                  파트너 로그인
                </NuxtLink>
              </div>
            </div>
          </div>
          <div class="w-px h-6 bg-gray-300"></div>
          <div class="flex items-center space-x-4">
            <div class="relative group">
              <button class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200">
                회원가입
              </button>
              <div class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <NuxtLink 
                  to="/customer/register" 
                  class="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors"
                >
                  고객 회원가입
                </NuxtLink>
                <NuxtLink 
                  to="/partner/register" 
                  class="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors"
                >
                  파트너 회원가입
                </NuxtLink>
              </div>
            </div>
          </div>
        </template>
        
        <!-- 로그인된 경우 -->
        <template v-else>
          <div class="text-gray-800 font-semibold text-lg">
            {{ user.role === 'customer' ? '고객' : user.role === 'partner' ? '파트너' : '사용자' }}님
          </div>
          <div class="w-px h-6 bg-gray-300"></div>
          
          <!-- 역할이 없는 경우 (회원가입 미완료) -->
          <template v-if="!user.role">
            <NuxtLink 
              to="/partner/register" 
              class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
            >
              회원가입 완료하기
            </NuxtLink>
            <div class="w-px h-6 bg-gray-300"></div>
          </template>
          
          <!-- 고객인 경우 신청한 견적 버튼 표시 -->
          <NuxtLink 
            v-if="user.role === 'customer'"
            to="/customer/requests" 
            class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
          >
            신청한 견적
          </NuxtLink>
          <!-- 파트너인 경우 견적 신청서 버튼 표시 -->
          <NuxtLink 
            v-if="user.role === 'partner'"
            to="/partner/requests" 
            class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
          >
            견적 신청서
          </NuxtLink>
          <div class="w-px h-6 bg-gray-300"></div>
          <!-- 고객인 경우 완료된 견적 버튼 표시 -->
          <NuxtLink 
            v-if="user.role === 'customer'"
            to="/customer/completed-quotes" 
            class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
          >
            완료된 견적
          </NuxtLink>
          <div class="w-px h-6 bg-gray-300"></div>
          <!-- 채팅 버튼 (모든 로그인된 사용자) -->
          <NuxtLink 
            to="/chat-list" 
            @click="calculateUnreadChatCount"
            class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full flex items-center"
          >
            채팅
            <span v-if="unreadChatCount > 0" class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
              {{ unreadChatCount > 99 ? '99+' : unreadChatCount }}
            </span>
          </NuxtLink>
          <div class="w-px h-6 bg-gray-300"></div>
          <button 
            @click="handleLogout"
            class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
          >
            로그아웃
          </button>
        </template>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center px-8">
      <!-- Hero Section -->
      <div class="mb-20 max-w-4xl">
        <div class="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8 animate-fade-in">
          ✨ 새로운 물류 솔루션
        </div>
        <h1 class="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight animate-slide-up">
          <span class="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            응답하라 창고
          </span>
        </h1>
        <p class="text-2xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
          물류창고 견적, 한 번에 쉽고 빠르게
        </p>
        <!-- 로그인되지 않은 경우 -->
        <div v-if="!user.isLoggedIn" class="flex flex-col items-center space-y-6 animate-bounce-in">
          <!-- 견적 신청하기 버튼 -->
          <div class="mb-4">
            <NuxtLink 
              to="/customer/login" 
              class="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span class="relative z-10 flex items-center space-x-3">
                <span>🚀</span>
                <span>견적 신청하기</span>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </NuxtLink>
          </div>
          
          <div class="text-center mb-4">
            <p class="text-lg text-gray-600 mb-6">간편한 전화번호 인증으로 시작하세요!</p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink 
              to="/customer/register" 
              class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span class="relative z-10 flex items-center space-x-2">
                <span>👤</span>
                <span>고객 회원가입</span>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </NuxtLink>
            
            <NuxtLink 
              to="/partner/register" 
              class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span class="relative z-10 flex items-center space-x-2">
                <span>🏢</span>
                <span>파트너 회원가입</span>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-green-700 to-teal-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </NuxtLink>
          </div>
          
          <div class="text-center">
            <p class="text-sm text-gray-500 mb-2">이미 계정이 있으신가요?</p>
              <div class="flex space-x-4 justify-center">
                <NuxtLink 
                  to="/customer/login" 
                  class="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  고객 로그인
                </NuxtLink>
                <span class="text-gray-300">|</span>
                <NuxtLink 
                  to="/login" 
                  class="text-green-600 hover:text-green-800 font-semibold transition-colors"
                >
                  파트너 로그인
                </NuxtLink>
              </div>
          </div>
        </div>

        <!-- 로그인되었지만 역할이 없는 경우 (회원가입 미완료) -->
        <div v-else-if="user.isLoggedIn && !user.role" class="flex flex-col items-center space-y-6 animate-bounce-in">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">회원가입을 완료해주세요</h2>
            <p class="text-lg text-gray-600 mb-6">전화번호 인증은 완료되었지만, 회원가입이 완료되지 않았습니다.</p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink 
              to="/partner/register" 
              class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span class="relative z-10 flex items-center space-x-2">
                <span>🏢</span>
                <span>파트너 회원가입 완료</span>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-green-700 to-teal-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </NuxtLink>
          </div>
        </div>

        <!-- 로그인된 고객인 경우 -->
        <div v-else-if="user.isLoggedIn && user.role === 'customer'" class="flex flex-col items-center space-y-6 animate-bounce-in">
          <!-- 견적 신청하기 버튼 -->
          <div class="mb-4">
            <NuxtLink 
              to="/request" 
              class="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span class="relative z-10 flex items-center space-x-3">
                <span>🚀</span>
                <span>견적 신청하기</span>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </NuxtLink>
          </div>
          
          <div class="text-center mb-4">
            <p class="text-lg text-gray-600 mb-6">빠르고 정확한 견적을 받아보세요!</p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink 
              to="/customer/requests" 
              class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span class="relative z-10 flex items-center space-x-2">
                <span>📋</span>
                <span>신청한 견적 확인</span>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-green-700 to-teal-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </NuxtLink>
            <NuxtLink 
              to="/customer/completed-quotes" 
              class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span class="relative z-10 flex items-center space-x-2">
                <span>✅</span>
                <span>완료된 견적</span>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </NuxtLink>
          </div>
        </div>

        <!-- 파트너인 경우 -->
        <div v-else-if="user.isLoggedIn && user.role === 'partner'" class="flex flex-col items-center animate-bounce-in">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">사용 가능한 견적 신청</h2>
            <div v-if="availableRequests.length > 0" class="text-2xl font-semibold text-blue-600">
              {{ availableRequests.length }}건의 견적 신청이 있습니다
            </div>
            <div v-else class="text-2xl font-semibold text-gray-500">
              0건입니다
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink 
              to="/partner/requests" 
              class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span class="relative z-10 flex items-center space-x-2">
                <span>📋</span>
                <span>견적 신청서 보기</span>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </NuxtLink>
            <NuxtLink 
              to="/partner/my-quotes" 
              class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span class="relative z-10 flex items-center space-x-2">
                <span>💼</span>
                <span>내 견적 관리</span>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-green-700 to-teal-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </NuxtLink>
          </div>
        </div>

        <!-- 관리자인 경우 -->
        <div v-else-if="user.isLoggedIn && user.role === 'admin'" class="flex justify-center animate-bounce-in">
          <div class="text-center">
            <p class="text-lg text-gray-600 mb-4">관리자로 로그인하셨습니다.</p>
            <p class="text-sm text-gray-500">관리자 페이지로 이동하세요.</p>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FirestoreService } from '~/lib/services/firestore'
import { where } from 'firebase/firestore'

// 사용자 스토어 사용
const user = useUserStore()

// Initialize auth listener
user.initializeAuth()

// 읽지 않은 메시지 수
const unreadChatCount = ref(0)

// 사용 가능한 견적 신청 목록 (파트너용)
const availableRequests = ref<any[]>([])

// 읽지 않은 메시지 수 계산
const calculateUnreadChatCount = async () => {
  try {
    if (!user.isLoggedIn || !user.currentUser?.uid) return
    
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // 사용자 역할에 따라 채팅 목록 가져오기
    let userChats
    if (user.role === 'customer') {
      userChats = await firestoreService.getChats([
        where('customerId', '==', user.currentUser.uid)
      ])
    } else if (user.role === 'partner') {
      userChats = await firestoreService.getChats([
        where('partnerId', '==', user.currentUser.uid)
      ])
    } else {
      return
    }
    
    let totalUnreadCount = 0
    
    for (const chat of userChats) {
      try {
        const messages = await firestoreService.getChatMessages(chat.id)
        const currentUserId = user.currentUser.uid
        
        // 마지막으로 읽은 시간 확인
        const lastReadAt = chat[`lastReadAt_${currentUserId}`]
        
        if (!lastReadAt) {
          // 마지막으로 읽은 시간이 없으면 모든 메시지가 읽지 않은 것으로 간주
          const unreadMessages = messages.filter(msg => msg.senderId !== currentUserId)
          totalUnreadCount += unreadMessages.length
        } else {
          // 마지막으로 읽은 시간 이후의 메시지 중 내가 보내지 않은 메시지 수
          const unreadMessages = messages.filter(msg => {
            if (msg.senderId === currentUserId) return false
            
            const messageTime = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt)
            return messageTime > lastReadAt
          })
          totalUnreadCount += unreadMessages.length
        }
      } catch (error) {
        console.error('채팅 메시지 확인 실패:', error)
      }
    }
    
    unreadChatCount.value = totalUnreadCount
  } catch (error) {
    console.error('읽지 않은 메시지 수 계산 실패:', error)
  }
}

// 사용 가능한 견적 신청 목록 로드 (파트너용)
const loadAvailableRequests = async () => {
  try {
    if (!user.isLoggedIn || user.role !== 'partner') return
    
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // 사용 가능한 견적 신청 목록 가져오기
    availableRequests.value = await firestoreService.getAvailableWarehouseRequests()
  } catch (error) {
    console.error('사용 가능한 견적 신청 목록 로드 실패:', error)
  }
}

// 로그인된 사용자는 적절한 페이지로 리다이렉트
onMounted(async () => {
  if (user.isLoggedIn) {
    // 읽지 않은 메시지 수 계산
    await calculateUnreadChatCount()
    
    // 파트너인 경우 사용 가능한 견적 신청 목록 로드
    if (user.role === 'partner') {
      await loadAvailableRequests()
    }
  }
})

// 로그아웃 함수
const handleLogout = async () => {
  try {
    await user.logout()
    // 로그아웃 후 메인 페이지로 리다이렉트 (이미 메인 페이지이므로 새로고침)
    window.location.reload()
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

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
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

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-slide-up {
  animation: slide-up 1s ease-out;
}

.animate-fade-in-delay {
  animation: fade-in 1s ease-out 0.3s both;
}

.animate-bounce-in {
  animation: bounce-in 1s ease-out 0.6s both;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

.shadow-3xl {
  box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
}
</style>