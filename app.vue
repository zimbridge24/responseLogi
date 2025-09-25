<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
// Auth 초기화를 앱 시작 시에 실행
const user = useUserStore()

// 클라이언트 사이드에서만 auth 초기화
onMounted(() => {
  console.log('App mounted, initializing auth...')
  user.initializeAuth()
})

// Auth 상태 변화 감지
watch(() => user.authReady, (ready) => {
  if (ready) {
    console.log('Auth is ready, user state:', {
      isAuthenticated: user.isAuthenticated,
      role: user.role,
      userId: user.currentUser?.uid
    })
  }
})
</script>
