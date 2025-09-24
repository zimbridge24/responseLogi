<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <svg class="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          관리자 로그인
        </h2>
        <p class="text-gray-600">
          관리자 전용 페이지입니다
        </p>
      </div>

      <!-- Form -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              관리자 ID
            </label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="관리자 ID를 입력하세요"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="ml-3">
                <p class="text-sm text-red-800 font-medium">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center items-center py-3 px-6 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? '로그인 중...' : '로그인' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Back to Main -->
      <div class="text-center">
        <NuxtLink 
          to="/" 
          class="text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          ← 메인 페이지로 돌아가기
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 폼 데이터
const formData = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

// 하드코딩된 관리자 정보
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: '123456'
}

// 로그인 처리
const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    // 하드코딩된 정보와 비교
    if (formData.value.username === ADMIN_CREDENTIALS.username && 
        formData.value.password === ADMIN_CREDENTIALS.password) {
      
      // 관리자 로그인 성공
      const userStore = useUserStore()
      
      // 관리자 정보로 사용자 상태 설정
      userStore.setAdminUser({
        uid: 'admin-user',
        email: 'admin@responserogi.com',
        role: 'admin',
        name: '관리자',
        companyName: '응답하라 창고',
        phone: '010-0000-0000'
      })

      console.log('관리자 로그인 성공')
      
      // 관리자 대시보드로 이동
      await navigateTo('/admin/dashboard')
    } else {
      error.value = '잘못된 관리자 ID 또는 비밀번호입니다.'
    }
  } catch (err: any) {
    console.error('관리자 로그인 실패:', err)
    error.value = '로그인에 실패했습니다. 다시 시도해주세요.'
  } finally {
    loading.value = false
  }
}

// 페이지 메타 설정
definePageMeta({
  layout: false
})
</script>

<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
