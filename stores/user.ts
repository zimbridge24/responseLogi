import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth'
import { FirestoreService } from '../lib/services/firestore'
import type { User as UserType } from '~/lib/types'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const userProfile = ref<UserType | null>(null)
  const role = ref<string | null>(null)
  const loading = ref(false)
  const loginAttempted = ref(false)
  const authInitialized = ref(false)
  const authReady = ref(false)
  const fcmToken = ref<string | null>(null)

  const auth = getAuth()
  let firestoreService: FirestoreService | null = null

  // Initialize Firestore service when needed
  const getFirestoreService = () => {
    if (!firestoreService) {
      const { $db } = useNuxtApp()
      firestoreService = new FirestoreService($db)
    }
    return firestoreService
  }

  // Initialize auth state listener only once
  const initializeAuth = () => {
    if (authInitialized.value) return
    
    console.log('Initializing auth state listener...')
    authInitialized.value = true
    
    onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out')
      currentUser.value = user
      console.log('currentUser.value set to:', currentUser.value?.uid)
      
      if (user) {
        // Load user profile from Firestore
        try {
          console.log('Loading user profile for:', user.uid)
          const service = getFirestoreService()
          userProfile.value = await service.getUser(user.uid)
          role.value = userProfile.value?.role || null
          console.log('User profile loaded:', {
            role: role.value,
            profile: userProfile.value,
            currentUser: currentUser.value?.uid
          })
          
          // FCM 초기화
          await initializeFCM()
        } catch (error) {
          console.error('Error loading user profile:', error)
          role.value = null
          userProfile.value = null
        }
      } else {
        role.value = null
        userProfile.value = null
        fcmToken.value = null
      }
      
      // Auth state is now ready
      authReady.value = true
      console.log('Auth ready:', authReady.value)
    })
  }

  const isAuthenticated = computed(() => !!currentUser.value)
  const isLoggedIn = computed(() => !!currentUser.value)
  const user = computed(() => userProfile.value)
  const isCustomer = computed(() => role.value === 'customer')
  const isPartner = computed(() => role.value === 'partner')
  const isSeller = computed(() => role.value === 'seller')
  const isAdmin = computed(() => role.value === 'admin')

  // FCM 토큰 발급 및 저장
  const initializeFCM = async () => {
    if (process.client && currentUser.value) {
      try {
        const { $fcm } = useNuxtApp()
        if ($fcm?.getToken) {
          const token = await $fcm.getToken()
          if (token) {
            fcmToken.value = token
            console.log('FCM 토큰이 초기화되었습니다:', token)
          }
        }
      } catch (error) {
        console.error('FCM 초기화 실패:', error)
      }
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    loginAttempted.value = true
    initializeAuth()
    
    try {
      console.log('Starting login process for:', email)
      await signInWithEmailAndPassword(auth, email, password)
      console.log('Firebase auth successful')
  
      // ✅ auth state가 준비될 때까지 기다렸다가 redirect
      const checkReady = setInterval(() => {
        if (authReady.value && role.value) {
          clearInterval(checkReady)
          redirectAfterLogin()
        }
      }, 100)
  
    } catch (error) {
      console.error('Login error:', error)
      loginAttempted.value = false
      throw error
    } finally {
      loading.value = false
    }
  }
  
  async function logout() {
    loading.value = true
    try {
      await signOut(auth)
      currentUser.value = null
      role.value = null
      userProfile.value = null
      loginAttempted.value = false
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(profileData: Partial<UserType>) {
    if (!currentUser.value) return
    
    loading.value = true
    try {
      const service = getFirestoreService()
      await service.updateUser(currentUser.value.uid, profileData)
      
      // Reload user profile
      userProfile.value = await service.getUser(currentUser.value.uid)
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  function redirectAfterLogin() {
    if (process.client) {
      let redirectUrl = '/'
      
      if (role.value === 'partner') {
        redirectUrl = '/partner/requests'
      } else if (role.value === 'customer') {
        redirectUrl = '/customer/requests'
      } else if (role.value === 'admin') {
        redirectUrl = '/admin/dashboard'
      }
      
      console.log('자동 리다이렉트:', redirectUrl)
      window.location.href = redirectUrl
    }
  }

  return {
    currentUser,
    userProfile,
    user,
    role,
    loading,
    fcmToken,
    isAuthenticated,
    isLoggedIn,
    isCustomer,
    isPartner,
    isSeller,
    isAdmin,
    login,
    logout,
    updateProfile,
    redirectAfterLogin,
    initializeAuth,
    initializeFCM,
    authReady
  }
})