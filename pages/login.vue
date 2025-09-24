<template>
  <div class="min-h-screen gradient-bg-blue flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-white mb-2">
          로그인
        </h2>
        <p class="text-blue-100">
          계정이 없으신가요?
          <NuxtLink to="/register" class="font-semibold text-white hover:text-blue-100 transition-colors underline">
            회원가입하기
          </NuxtLink>
        </p>
      </div>

      <!-- Form -->
      <div class="card">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="form-label">이메일</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              class="form-input"
              placeholder="example@email.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="form-label">비밀번호</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              class="form-input"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
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
              :disabled="user.loading"
              class="btn-primary w-full flex justify-center items-center py-4 px-6 text-lg font-semibold"
            >
              <svg v-if="user.loading" class="loading-spinner -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ user.loading ? '로그인 중...' : '로그인하기' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 폼 데이터
const router = useRouter()
const formData = ref({
  email: '',
  password: ''
})

const user = useUserStore()

// Initialize auth listener
user.initializeAuth()
const error = ref('')

const handleSubmit = async () => {
  try {
    await user.login(formData.value.email, formData.value.password)
    // ✅ 여기서는 redirect를 신경 쓸 필요 없음
  } catch (err) {
    console.error('Login error:', err)
    error.value = '로그인에 실패했습니다.'
  }
}

</script>
