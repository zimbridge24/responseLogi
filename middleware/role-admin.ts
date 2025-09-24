export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useUserStore()
  
  // 사용자가 로그인되어 있지 않으면 관리자 로그인 페이지로 리다이렉트
  if (!user.currentUser) {
    return navigateTo('/admin/login')
  }
  
  // 사용자 프로필이 아직 로드되지 않았으면 잠시 대기
  if (!user.userProfile) {
    // 최대 3초까지 대기
    let attempts = 0
    while (!user.userProfile && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
  }
  
  // 관리자 권한 확인 (하드코딩된 관리자 또는 일반 관리자)
  if (!user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Admin role required.'
    })
  }
})
