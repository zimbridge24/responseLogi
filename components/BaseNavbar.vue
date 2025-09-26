<template>
  <nav class="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-14 sm:h-16">
        <!-- Logo -->
        <NuxtLink :to="getHomePath()" class="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white text-lg sm:text-xl">📦</span>
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-lg sm:text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              <span class="hidden sm:inline">응답하라 창고</span>
              <span class="sm:hidden">응답하라</span>
            </span>
            <span v-if="user.role === 'partner'" class="text-xs text-gray-500 -mt-1">
              (파트너)
            </span>
          </div>
        </NuxtLink>

        <!-- Navigation Links -->
        <div class="flex items-center space-x-2 sm:space-x-4 lg:space-x-8">
          <!-- Requests -->
          <NuxtLink 
            :to="getRequestsPath()"
            class="text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base transition-colors duration-200"
          >
            <span class="hidden sm:inline">{{ getRequestsText() }}</span>
            <span class="sm:hidden">{{ getRequestsText().replace('내 요청', '요청').replace('내가 보낸 견적서', '견적서').replace('요청 관리', '관리') }}</span>
          </NuxtLink>
          
          <!-- Customer specific navigation -->
          <template v-if="user.role === 'customer'">
            <div class="w-px h-4 sm:h-6 bg-gray-300"></div>
            <NuxtLink 
              to="/customer/completed-quotes"
              class="text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base transition-colors duration-200"
            >
              <span class="hidden sm:inline">수락한 견적</span>
              <span class="sm:hidden">완료</span>
            </NuxtLink>
          </template>
          
          <!-- Partner specific navigation -->
          <template v-if="user.role === 'partner'">
            <div class="w-px h-4 sm:h-6 bg-gray-300"></div>
            <NuxtLink 
              to="/partner/my-quotes"
              class="text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base transition-colors duration-200"
            >
              <span class="hidden sm:inline">내가 보낸 견적서</span>
              <span class="sm:hidden">견적서</span>
            </NuxtLink>
            <div class="w-px h-4 sm:h-6 bg-gray-300"></div>
            <NuxtLink 
              to="/partner/completed-quotes"
              class="text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base transition-colors duration-200"
            >
              <span class="hidden sm:inline">확정견적</span>
              <span class="sm:hidden">확정</span>
            </NuxtLink>
          </template>
          
          <div class="w-px h-4 sm:h-6 bg-gray-300"></div>
          
          <!-- Chat with Badge -->
          <NuxtLink 
            to="/chat-list"
            class="relative text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base transition-colors duration-200"
          >
            채팅
            <!-- Unread Message Badge - Small red dot -->
            <span 
              v-if="totalUnreadCount > 0"
              class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
            ></span>
          </NuxtLink>
          
          <div class="w-px h-4 sm:h-6 bg-gray-300"></div>
          
          <!-- Logout -->
          <button 
            @click="handleLogout"
            class="text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base transition-colors duration-200"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

const user = useUserStore()
const chats = useChatsStore()

// Initialize auth listener
user.initializeAuth()

// Computed properties
const totalUnreadCount = computed(() => chats.totalUnreadCount)

  // Methods
  const getHomePath = () => {
    switch (user.role) {
      case 'customer': return '/customer/requests'
      case 'partner': return '/partner'
      case 'admin': return '/admin/requests'
      default: return '/'
    }
  }

  const getRequestsPath = () => {
    switch (user.role) {
      case 'customer': return '/customer/requests'
      case 'partner': return '/partner'
      case 'admin': return '/admin/requests'
      default: return '/'
    }
  }

  const getRequestsText = () => {
    switch (user.role) {
      case 'customer': return '내 요청'
      case 'partner': return '홈'
      case 'admin': return '요청 관리'
      default: return '요청'
    }
  }

const handleLogout = async () => {
  try {
    await user.logout()
    navigateTo('/')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}

// Load chats when component mounts
onMounted(async () => {
  if (user.isLoggedIn && user.currentUser && (user.role === 'customer' || user.role === 'partner')) {
    try {
      await chats.fetchChats(user.currentUser.uid, user.role)
    } catch (error) {
      console.error('채팅 목록 로드 실패:', error)
    }
  }
})
</script>
