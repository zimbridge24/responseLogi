export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useUserStore()
  
  // 사용자가 로그인되어 있지 않으면 관리자 로그인 페이지로 리다이렉트
  if (!user.currentUser) {
    console.log('관리자 미들웨어: 사용자 로그인되지 않음, /admin/login으로 리다이렉트')
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
  
  console.log('관리자 미들웨어: 사용자 정보:', {
    currentUser: user.currentUser,
    userProfile: user.userProfile,
    role: user.role,
    isAdmin: user.isAdmin
  })
  
  // 관리자 권한 확인 (하드코딩된 관리자 또는 일반 관리자)
  if (!user.isAdmin) {
    console.log('관리자 미들웨어: 관리자 권한 없음, /admin/login으로 리다이렉트')
    return navigateTo('/admin/login')
  }
  
  console.log('관리자 미들웨어: 관리자 권한 확인됨')
})
