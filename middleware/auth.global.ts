export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side to avoid hydration mismatch
  if (process.server) {
    return
  }
  
  const user = useUserStore()
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/', '/test-firebase-simple', '/test-simple', '/debug', '/admin/login']
  
  // Initialize auth listener if not already done
  user.initializeAuth()
  
  // If the route is public, allow access
  if (publicRoutes.includes(to.path)) {
    return
  }
  
  // Wait for auth to be ready before checking authentication (관리자는 예외)
  if (!user.authReady && !user.isAdmin) {
    // If auth is not ready yet, wait a bit and then check
    setTimeout(() => {
      if (!user.isAuthenticated && !user.isAdmin) {
        console.log('User not authenticated, redirecting to login')
        navigateTo('/login')
      }
    }, 1000)
    return
  }
  
  // Check if user is authenticated (관리자는 예외)
  if (!user.isAuthenticated && !user.isAdmin) {
    console.log('User not authenticated, redirecting to login')
    navigateTo('/login')
    return
  }
  
  // Check role-based access
  if (to.path.startsWith('/admin') && to.path !== '/admin/login' && !user.isAdmin) {
    console.log('Admin access denied, redirecting to admin login')
    navigateTo('/admin/login')
    return
  }
  
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
