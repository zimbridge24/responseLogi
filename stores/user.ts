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

  let auth: any = null
  let firestoreService: FirestoreService | null = null

  // Firebase 앱이 초기화된 후 auth 인스턴스 가져오기
  const getAuthInstance = () => {
    if (!auth) {
      try {
        const { $auth } = useNuxtApp()
        auth = $auth
        console.log('Auth instance retrieved:', !!auth)
      } catch (error) {
        console.error('Failed to get auth instance:', error)
        return null
      }
    }
    return auth
  }

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
    
    const authInstance = getAuthInstance()
    if (!authInstance) {
      console.error('Firebase auth not initialized')
      // Retry after a short delay
      setTimeout(() => {
        if (!authInitialized.value) {
          initializeAuth()
        }
      }, 1000)
      return
    }
    
    onAuthStateChanged(authInstance, async (user) => {
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
    
    try {
      console.log('Starting login process for:', email)
      
      // Firebase 초기화를 기다림
      let authInstance = getAuthInstance()
      let attempts = 0
      const maxAttempts = 10
      
      while (!authInstance && attempts < maxAttempts) {
        console.log(`Waiting for Firebase auth initialization... attempt ${attempts + 1}`)
        await new Promise(resolve => setTimeout(resolve, 100))
        authInstance = getAuthInstance()
        attempts++
      }
      
      if (!authInstance) {
        throw new Error('Firebase auth not initialized after waiting')
      }
      
      console.log('Firebase auth is ready, proceeding with login')
      initializeAuth()
      await signInWithEmailAndPassword(authInstance, email, password)
      console.log('Firebase auth successful')
  
      // ✅ auth state와 사용자 프로필이 준비될 때까지 기다렸다가 redirect
      const checkReady = setInterval(() => {
        if (authReady.value && role.value && userProfile.value) {
          clearInterval(checkReady)
          console.log('Login redirect ready:', {
            role: role.value,
            approvalStatus: userProfile.value?.approvalStatus,
            userProfile: userProfile.value
          })
          redirectAfterLogin()
        }
      }, 100)
      
      // 최대 10초 후에는 강제로 리다이렉트 (타임아웃 방지)
      setTimeout(() => {
        if (authReady.value && role.value) {
          clearInterval(checkReady)
          console.log('Login redirect timeout, proceeding with basic redirect')
          redirectAfterLogin()
        }
      }, 10000)
  
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
      const authInstance = getAuthInstance()
      if (!authInstance) {
        throw new Error('Firebase auth not initialized')
      }
      await signOut(authInstance)
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
        // 파트너는 승인 상태에 따라 적절한 페이지로 리다이렉트
        if (userProfile.value?.approvalStatus === 'approved') {
          redirectUrl = '/' // 파트너 메인 페이지 (견적 신청서 목록)
        } else if (userProfile.value?.approvalStatus === 'rejected') {
          redirectUrl = '/partner/rejected'
        } else {
          redirectUrl = '/partner/pending'
        }
      } else if (role.value === 'customer') {
        redirectUrl = '/customer/requests'
      } else if (role.value === 'admin') {
        redirectUrl = '/admin/dashboard'
      }
      
      console.log('자동 리다이렉트:', redirectUrl)
      // window.location.href 대신 navigateTo 사용
      navigateTo(redirectUrl)
    }
  }

  // 관리자 사용자 설정 (하드코딩된 로그인용)
  function setAdminUser(adminData: any) {
    currentUser.value = {
      uid: adminData.uid,
      email: adminData.email,
      displayName: adminData.name,
      phoneNumber: adminData.phone,
      // Firebase User 타입에 맞는 기본값들
      emailVerified: true,
      isAnonymous: false,
      metadata: {} as any,
      providerData: [],
      refreshToken: 'admin-token',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'admin-token',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({})
    }
    
    userProfile.value = {
      uid: adminData.uid,
      email: adminData.email,
      name: adminData.name,
      companyName: adminData.companyName,
      phone: adminData.phone,
      role: 'admin',
      approvalStatus: 'approved',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    role.value = 'admin'
    authReady.value = true
    
    console.log('관리자 사용자 설정 완료:', adminData.name)
  }

  // 일반 사용자 설정 (파트너/고객 로그인용)
  const setUser = async (firebaseUser: User, userData: any) => {
    currentUser.value = firebaseUser
    userProfile.value = {
      uid: firebaseUser.uid,
      email: userData.email || firebaseUser.email || '',
      name: userData.name || firebaseUser.displayName || '',
      companyName: userData.companyName || '',
      phone: userData.phone || firebaseUser.phoneNumber || '',
      role: userData.role || 'customer',
      approvalStatus: userData.approvalStatus || 'approved',
      createdAt: userData.createdAt || new Date(),
      updatedAt: userData.updatedAt || new Date()
    }
    
    role.value = userData.role || 'customer'
    authReady.value = true
    
    console.log('사용자 설정 완료:', userData.name, '역할:', userData.role)
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
    setAdminUser,
    setUser,
    authReady
  }
})