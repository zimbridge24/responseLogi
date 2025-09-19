export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side to avoid hydration mismatch
  if (process.server) {
    return
  }
  
  const user = useUserStore()
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/', '/test-firebase-simple', '/test-simple', '/debug']
  
  // If the route is public, allow access
  if (publicRoutes.includes(to.path)) {
    return
  }
  
  // Initialize auth listener if not already done
  user.initializeAuth()
  
  // For all other routes, let the page handle authentication
  // This prevents hydration mismatch by not redirecting in middleware
  return
})
