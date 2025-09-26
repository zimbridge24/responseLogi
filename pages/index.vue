<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute top-40 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Navigation -->
    <nav class="relative z-10 flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 backdrop-blur-sm bg-white/80 border-b border-white/20">
      <div class="flex items-center space-x-2 sm:space-x-3">
        <NuxtLink to="/" class="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white text-lg sm:text-xl">📦</span>
          </div>
          <span class="font-bold text-lg sm:text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            <span class="hidden sm:inline">응답하라 창고</span>
            <span class="sm:hidden">응답하라</span>
          </span>
        </NuxtLink>
      </div>
      <div class="flex items-center space-x-2 sm:space-x-4 lg:space-x-8">
        <!-- 로그인된 경우 -->
        <template v-if="user.isLoggedIn">
          <!-- 디버깅용: 사용자 정보 출력 -->
          <div v-if="process.dev" class="text-xs text-red-500 mr-4">
            Debug: {{ user.role }} | {{ user.profile?.name }}
          </div>
          
          <!-- 고객인 경우 신청한 견적 버튼 표시 -->
          <NuxtLink 
            v-if="user.role === 'customer'"
            to="/customer/requests" 
            class="text-gray-800 hover:text-gray-900 font-semibold text-sm sm:text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full text-center"
          >
            <span class="hidden sm:inline">신청한<br>견적</span>
            <span class="sm:hidden">견적</span>
          </NuxtLink>
          
          <!-- 파트너인 경우 네비게이션 -->
          <template v-if="user.role === 'partner'">
            <NuxtLink 
              to="/partner/my-quotes" 
              class="text-gray-800 hover:text-gray-900 font-semibold text-sm sm:text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
            >
              <span class="hidden sm:inline">내가 보낸 견적서</span>
              <span class="sm:hidden">견적서</span>
            </NuxtLink>
            <div class="w-px h-4 sm:h-6 bg-gray-300"></div>
            <NuxtLink 
              to="/partner/completed-quotes" 
              class="text-gray-800 hover:text-gray-900 font-semibold text-sm sm:text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
            >
              <span class="hidden sm:inline">확정견적</span>
              <span class="sm:hidden">확정</span>
            </NuxtLink>
          </template>
          
          <!-- 고객인 경우 세로선과 완료된 견적 버튼 표시 -->
          <template v-if="user.role === 'customer'">
            <div class="w-px h-4 sm:h-6 bg-gray-300"></div>
            <NuxtLink 
              to="/customer/completed-quotes" 
              class="text-gray-800 hover:text-gray-900 font-semibold text-sm sm:text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full text-center"
            >
              <span class="hidden sm:inline">수락한<br>견적</span>
              <span class="sm:hidden">완료</span>
            </NuxtLink>
          </template>
          <div class="w-px h-4 sm:h-6 bg-gray-300"></div>
          
          <!-- 채팅 버튼 (모든 로그인된 사용자) -->
          <NuxtLink 
            to="/chat-list" 
            @click="calculateUnreadChatCount"
            class="text-gray-800 hover:text-gray-900 font-semibold text-sm sm:text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full flex items-center"
          >
            채팅
            <span v-if="unreadChatCount > 0" class="ml-1 sm:ml-2 inline-flex items-center px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold bg-red-500 text-white">
              {{ unreadChatCount > 99 ? '99+' : unreadChatCount }}
            </span>
          </NuxtLink>
          <div class="w-px h-4 sm:h-6 bg-gray-300"></div>
          <button 
            @click="handleLogout"
            class="text-gray-600 hover:text-gray-800 font-medium text-xs sm:text-sm transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
          >
            LogOut
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
          <!-- 큰 견적 신청하기 버튼 -->
          <div class="mb-8">
            <NuxtLink 
              to="/customer/login" 
              class="group relative inline-flex items-center justify-center px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span class="relative z-10 flex items-center space-x-4">
                <span class="text-3xl">🚀</span>
                <span>견적 신청하기</span>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </NuxtLink>
          </div>
          
          <div class="text-center mb-6">
            <p class="text-lg text-gray-600 mb-4">10초만에 견적을 신청해보세요!</p>
          </div>
          
          <!-- 로그인 버튼들 -->
          <div class="text-center mb-6">
            <div class="flex space-x-4 justify-center">
              <NuxtLink 
                to="/customer/login" 
                class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                고객 로그인
              </NuxtLink>
              <NuxtLink 
                to="/login" 
                class="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                업체 로그인
              </NuxtLink>
            </div>
          </div>
          
          <!-- 회원가입 버튼들 -->
          <div class="text-center">
            <p class="text-sm text-gray-500 mb-3">계정이 없으신가요?</p>
            <div class="flex space-x-4 justify-center">
              <NuxtLink 
                to="/customer/register" 
                class="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                고객 회원가입
              </NuxtLink>
              <span class="text-gray-300">|</span>
              <NuxtLink 
                to="/partner/register" 
                class="text-green-600 hover:text-green-800 font-semibold transition-colors"
              >
                업체 회원가입
              </NuxtLink>
            </div>
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
        <div v-else-if="user.isLoggedIn && user.role === 'partner'" class="w-full max-w-6xl mx-auto">
          <!-- 승인 대기 중인 파트너 -->
          <div v-if="user.user?.approvalStatus === 'pending'" class="text-center py-16">
            <div class="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span class="text-6xl">⏳</span>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-4">승인 대기 중</h2>
            <p class="text-lg text-gray-600 mb-8">
              관리자가 제출하신 서류를 검토하고 있습니다.<br>
              승인 완료 후 견적 신청서를 확인할 수 있습니다.
            </p>
            <NuxtLink 
              to="/partner/pending" 
              class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              승인 상태 확인하기
            </NuxtLink>
          </div>
          
          <!-- 거절된 파트너 -->
          <div v-else-if="user.user?.approvalStatus === 'rejected'" class="text-center py-16">
            <div class="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span class="text-6xl">❌</span>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-4">승인이 거절되었습니다</h2>
            <p class="text-lg text-gray-600 mb-8">
              제출하신 서류에 문제가 있어 승인이 거절되었습니다.<br>
              자세한 내용은 고객센터로 문의해주세요.
            </p>
            <NuxtLink 
              to="/partner/rejected" 
              class="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              자세히 보기
            </NuxtLink>
          </div>
          
          <!-- 승인된 파트너 -->
          <div v-else-if="user.user?.approvalStatus === 'approved'">
          <div class="flex items-center justify-between mb-8">
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight animate-slide-up">
              <span class="bg-gradient-to-r from-green-600 via-teal-600 to-green-800 bg-clip-text text-transparent">
                사용 가능한 견적 신청서
              </span>
            </h1>
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full shadow-lg">
              <span class="text-white font-bold text-lg">
                총 {{ availableRequests.length }}건
              </span>
            </div>
          </div>

          <!-- 로딩 상태 -->
          <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p class="mt-4 text-gray-600">견적 신청서를 불러오는 중...</p>
          </div>

          <!-- 견적 신청서가 없는 경우 -->
          <div v-else-if="availableRequests.length === 0" class="text-center py-16">
            <div class="text-6xl mb-4">📋</div>
            <h3 class="text-2xl font-semibold text-gray-900 mb-2">사용 가능한 견적 신청서가 없습니다</h3>
            <p class="text-gray-600">새로운 견적 신청서를 기다려주세요!</p>
          </div>

          <!-- 견적 신청서 카드 목록 -->
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              v-for="(request, index) in availableRequests" 
              :key="request.id"
              @click="viewRequest(request)"
              class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                  <span class="text-white text-sm font-bold">{{ index + 1 }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    신규
                  </span>
                  <button 
                    @click.stop="deleteRequest(request.id, index)"
                    class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                    title="삭제"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="text-center mb-3">
                <p class="text-xs text-gray-500">{{ formatDate(request.createdAt) }}</p>
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">팔렛</span>
                  <span class="font-medium">{{ request.pallets || 0 }}개</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">박스</span>
                  <span class="font-medium">{{ request.boxes || 0 }}개</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">보관</span>
                  <span class="font-medium">{{ request.storagePeriod || 0 }}{{ getPeriodUnit(request.storagePeriodUnit) }}</span>
                </div>
              </div>
            </div>
          </div>
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
import { onMounted, ref, watch } from 'vue'
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

// 로딩 상태
const loading = ref(false)

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
    if (!user.isLoggedIn || user.role !== 'partner') {
      return
    }
    
    loading.value = true
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // 사용 가능한 견적 신청 목록 가져오기 (파트너 ID 전달)
    const requests = await firestoreService.getAvailableWarehouseRequests(user.currentUser?.uid)
    availableRequests.value = requests
  } catch (error) {
    console.error('사용 가능한 견적 신청 목록 로드 실패:', error)
  } finally {
    loading.value = false
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

// 사용자 상태 변경 감지
watch(() => user.isLoggedIn, async (newValue) => {
  if (newValue && user.role === 'partner') {
    await loadAvailableRequests()
  }
})

watch(() => user.role, async (newValue) => {
  if (newValue === 'partner' && user.isLoggedIn) {
    await loadAvailableRequests()
  }
})

// 견적 신청서 상세보기
const viewRequest = (request: any) => {
  // 견적 신청서 상세 페이지로 이동
  navigateTo(`/partner/quote/${request.id}`)
}

// 견적 신청서 삭제
const deleteRequest = async (requestId: string, index: number) => {
  if (!confirm('이 견적 신청서를 삭제하시겠습니까?')) {
    return
  }
  
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // Firestore에서 삭제
    await firestoreService.deleteWarehouseRequest(requestId)
    
    // 로컬 배열에서 제거
    availableRequests.value.splice(index, 1)
  } catch (error) {
    console.error('견적 신청서 삭제 실패:', error)
    alert('견적 신청서 삭제에 실패했습니다. 다시 시도해주세요.')
  }
}

// 날짜 포맷팅
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// 기간 단위
const getPeriodUnit = (unit: string) => {
  switch (unit) {
    case 'day':
      return '일'
    case 'month':
      return '개월'
    case 'year':
      return '년'
    default:
      return ''
  }
}

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