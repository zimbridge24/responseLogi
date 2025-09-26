export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side to avoid hydration mismatch
  if (process.server) {
    return
  }
  
  const user = useUserStore()
  
  // 관리자 로그인 페이지는 완전 예외 처리
  if (to.path.startsWith('/admin/login')) {
    console.log('Admin login page accessed, allowing access')
    return
  }
  
  // 일반 로그인 페이지도 완전 예외 처리
  if (to.path === '/login') {
    console.log('Login page accessed, allowing access')
    return
  }
  
  // Public routes that don't require authentication
  const publicRoutes = ['/register', '/', '/test-firebase-simple', '/test-simple', '/debug', '/customer/login', '/customer/register', '/partner/register']
  
  if (publicRoutes.includes(to.path)) {
    console.log('Public route accessed:', to.path)
    return
  }
  
  // Initialize auth listener if not already done
  user.initializeAuth()
  
  // Wait for auth to be ready before checking authentication
  if (!user.authReady) {
    // If auth is not ready yet, wait a bit and then check
    setTimeout(() => {
      if (!user.isAuthenticated) {
        console.log('User not authenticated, redirecting to home')
        navigateTo('/')
      }
    }, 1000)
    return
  }
  
  // Check if user is authenticated
  if (!user.isAuthenticated) {
    console.log('User not authenticated, redirecting to home')
    navigateTo('/')
    return
  }
  
  // Role-based access (admin routes are handled by role-admin.ts)
  if (to.path.startsWith('/partner') && !user.isPartner) {
    console.log('Partner access denied, redirecting to home')
    navigateTo('/')
    return
  }
  
  if (to.path.startsWith('/customer') && !user.isCustomer) {
    console.log('Customer access denied, redirecting to home')
    navigateTo('/')
    return
  }
})
