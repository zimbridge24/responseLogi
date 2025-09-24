<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute top-40 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Navigation -->
    <nav class="relative z-10 flex justify-between items-center px-8 py-6 backdrop-blur-sm bg-white/80 border-b border-white/20">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
          <span class="text-white text-xl">👑</span>
        </div>
        <span class="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          관리자 대시보드
        </span>
      </div>
      <div class="flex items-center space-x-8">
        <div class="text-gray-800 font-semibold text-lg">
          {{ user.user?.name || 'Admin' }}님
        </div>
        <div class="w-px h-6 bg-gray-300"></div>
        <NuxtLink 
          to="/admin/approvals"
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          승인 관리
        </NuxtLink>
        <div class="w-px h-6 bg-gray-300"></div>
        <NuxtLink 
          to="/admin/partners"
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          파트너 관리
        </NuxtLink>
        <div class="w-px h-6 bg-gray-300"></div>
        <button 
          @click="handleLogout"
          class="text-gray-800 hover:text-gray-900 font-semibold text-lg transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-400 after:transition-all after:duration-200 hover:after:w-full"
        >
          로그아웃
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="relative z-10 px-8 py-16">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">관리자 대시보드</h1>
          <p class="text-xl text-gray-600">파트너 승인 관리 및 시스템 현황을 확인하세요</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div class="flex items-center">
              <div class="p-3 bg-yellow-100 rounded-xl">
                <span class="text-2xl">⏳</span>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">승인 대기</p>
                <p class="text-2xl font-bold text-gray-900">{{ pendingPartners }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div class="flex items-center">
              <div class="p-3 bg-green-100 rounded-xl">
                <span class="text-2xl">✅</span>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">승인된 파트너</p>
                <p class="text-2xl font-bold text-gray-900">{{ approvedPartners }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 rounded-xl">
                <span class="text-2xl">📋</span>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">총 요청</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalRequests }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div class="flex items-center">
              <div class="p-3 bg-purple-100 rounded-xl">
                <span class="text-2xl">💰</span>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">총 견적</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalQuotes }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div class="flex items-center">
              <div class="p-3 bg-emerald-100 rounded-xl">
                <span class="text-2xl">🎯</span>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">완료된 견적</p>
                <p class="text-2xl font-bold text-gray-900">{{ completedQuotes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900">파트너 승인 관리</h2>
              <NuxtLink 
                to="/admin/approvals"
                class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>📋</span>
                <span>상세 승인 관리</span>
              </NuxtLink>
            </div>
            
            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center h-48">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

            <!-- Empty State -->
            <div v-else-if="pendingPartnersList.length === 0" class="text-center py-12 text-gray-500">
              <div class="text-6xl mb-4">✅</div>
              <h3 class="text-xl font-semibold text-gray-700 mb-2">승인 대기 중인 파트너가 없습니다</h3>
              <p class="text-gray-500">새로운 파트너 신청이 있으면 여기에 표시됩니다.</p>
            </div>

            <!-- Partners List -->
            <div v-else class="space-y-4">
              <div 
                v-for="partner in pendingPartnersList" 
                :key="partner.id"
                class="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-4 mb-4">
                      <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span class="text-xl">🏢</span>
                      </div>
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900">{{ partner.companyName || '회사명 없음' }}</h3>
                        <p class="text-sm text-gray-600">{{ partner.name }} ({{ partner.email }})</p>
                        <p class="text-xs text-gray-500">신청일: {{ formatDate(partner.createdAt) }}</p>
                      </div>
                    </div>

                    <!-- KYC Documents -->
                    <div class="bg-white rounded-lg p-4 mb-4">
                      <h4 class="text-sm font-medium text-gray-700 mb-3">제출된 서류</h4>
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div class="flex items-center space-x-2">
                          <span class="text-green-500">✓</span>
                          <span 
                            @click="viewDocument(partner.kycDocuments?.businessLicense?.downloadUrl)"
                            class="text-sm text-blue-600 hover:text-blue-800 cursor-pointer underline hover:no-underline transition-all"
                          >
                            사업자등록증
                          </span>
                        </div>
                        <div class="flex items-center space-x-2">
                          <span class="text-green-500">✓</span>
                          <span 
                            @click="viewDocument(partner.kycDocuments?.insurancePolicy?.downloadUrl)"
                            class="text-sm text-blue-600 hover:text-blue-800 cursor-pointer underline hover:no-underline transition-all"
                          >
                            보험 증권
                          </span>
                        </div>
                        <div class="flex items-center space-x-2">
                          <span class="text-green-500">✓</span>
                          <span 
                            @click="viewDocument(partner.kycDocuments?.warehousePhoto?.downloadUrl)"
                            class="text-sm text-blue-600 hover:text-blue-800 cursor-pointer underline hover:no-underline transition-all"
                          >
                            창고 사진
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Contact Info -->
                    <div class="text-sm text-gray-600">
                      <p>전화번호: {{ partner.phone || '미제공' }}</p>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex space-x-3 ml-6">
                    <button 
                      @click="approvePartner(partner.id)"
                      class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      승인
                    </button>
                    <button 
                      @click="rejectPartner(partner.id)"
                      class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      거절
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Document Viewer Modal -->
    <div v-if="documentViewerUrl" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4" style="z-index: 9999;">
      <div class="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-semibold">문서 보기</h3>
          <button 
            @click="documentViewerUrl = null"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="text-2xl">×</span>
          </button>
        </div>
        <div class="p-4">
          <!-- 이미지 파일인 경우 -->
          <img 
            v-if="documentViewerUrl && isImageFile(documentViewerUrl)" 
            :src="documentViewerUrl" 
            class="w-full h-[70vh] object-contain border-0"
            alt="문서 이미지"
          />
          <!-- PDF 파일인 경우 -->
          <iframe 
            v-else-if="documentViewerUrl" 
            :src="documentViewerUrl" 
            class="w-full h-[70vh] border-0"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FirestoreService } from '~/lib/services/firestore'

// 로그인 체크
const user = useUserStore()

onMounted(async () => {
  // 사용자 상태가 로드될 때까지 잠시 대기
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (!user.isLoggedIn || user.role !== 'admin') {
    navigateTo('/login')
    return
  }
  
  loadData()
})

const loading = ref(false)
const pendingPartners = ref(0)
const approvedPartners = ref(0)
const totalRequests = ref(0)
const totalQuotes = ref(0)
const completedQuotes = ref(0)
const pendingPartnersList = ref([])
const documentViewerUrl = ref<string | null>(null)

// 데이터 로드
const loadData = async () => {
  loading.value = true
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    console.log('=== 관리자 데이터 로드 시작 ===')
    console.log('현재 사용자:', user.user)
    console.log('사용자 역할:', user.role)
    
    // 모든 사용자 먼저 확인
    console.log('모든 사용자 조회 중...')
    const allUsers = await firestoreService.getAllUsers()
    console.log('전체 사용자 수:', allUsers.length)
    console.log('전체 사용자 목록:', allUsers.map(u => ({ id: u.id, email: u.email, role: u.role, approvalStatus: u.approvalStatus })))
    
    // 파트너 목록 로드
    console.log('파트너 사용자 조회 중...')
    const partners = await firestoreService.getUsersByRole('partner')
    console.log('파트너 수:', partners.length)
    console.log('파트너 목록:', partners.map(p => ({ 
      id: p.id, 
      email: p.email, 
      name: p.name, 
      companyName: p.companyName,
      approvalStatus: p.approvalStatus,
      createdAt: p.createdAt 
    })))
    
    // 승인 상태별로 분류
    const pending = partners.filter(p => p.approvalStatus === 'pending')
    const approved = partners.filter(p => p.approvalStatus === 'approved')
    const rejected = partners.filter(p => p.approvalStatus === 'rejected')
    
    console.log('승인 상태별 분류:')
    console.log('- 대기 중:', pending.length, pending.map(p => p.email))
    console.log('- 승인됨:', approved.length, approved.map(p => p.email))
    console.log('- 거절됨:', rejected.length, rejected.map(p => p.email))
    
    pendingPartnersList.value = pending
    pendingPartners.value = pending.length
    approvedPartners.value = approved.length
    
    // 요청/견적 데이터 로드
    console.log('요청/견적 데이터 로드 중...')
    const requests = await firestoreService.getAllRequests()
    const quotes = await firestoreService.getAllBids()
    const completedQuotesList = await firestoreService.getCompletedQuotes()
    
    totalRequests.value = requests.length
    totalQuotes.value = quotes.length
    completedQuotes.value = completedQuotesList.length
    
    console.log('=== 데이터 로드 완료 ===')
    console.log('최종 통계:', {
      pendingPartners: pendingPartners.value,
      approvedPartners: approvedPartners.value,
      totalRequests: totalRequests.value,
      totalQuotes: totalQuotes.value,
      completedQuotes: completedQuotes.value
    })
    
  } catch (error) {
    console.error('데이터 로드 실패:', error)
    console.error('에러 상세:', error.message)
  } finally {
    loading.value = false
  }
}

// 날짜 포맷팅
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// 파트너 승인
const approvePartner = async (partnerId: string) => {
  if (!confirm('이 파트너를 승인하시겠습니까?')) return
  
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    await firestoreService.updateUser(partnerId, {
      approvalStatus: 'approved',
      updatedAt: new Date()
    })
    
    // 목록에서 제거
    pendingPartnersList.value = pendingPartnersList.value.filter(p => p.id !== partnerId)
    pendingPartners.value = pendingPartnersList.value.length
    approvedPartners.value += 1
    
    alert('파트너가 승인되었습니다.')
  } catch (error) {
    console.error('파트너 승인 실패:', error)
    alert('파트너 승인에 실패했습니다.')
  }
}

// 파트너 거절
const rejectPartner = async (partnerId: string) => {
  if (!confirm('이 파트너를 거절하시겠습니까?')) return
  
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    await firestoreService.updateUser(partnerId, {
      approvalStatus: 'rejected',
      updatedAt: new Date()
    })
    
    // 목록에서 제거
    pendingPartnersList.value = pendingPartnersList.value.filter(p => p.id !== partnerId)
    pendingPartners.value = pendingPartnersList.value.length
    
    alert('파트너가 거절되었습니다.')
  } catch (error) {
    console.error('파트너 거절 실패:', error)
    alert('파트너 거절에 실패했습니다.')
  }
}

// 개별 문서 보기
const viewDocument = async (url: string) => {
  if (!url) {
    alert('문서가 없습니다.')
    return
  }
  try {
    // Firestore에서 저장된 파일인지 확인
    if (url.startsWith('firestore://files/')) {
      const fileId = url.replace('firestore://files/', '')
      const { $db } = useNuxtApp()
      const { doc, getDoc } = await import('firebase/firestore')
      
      const fileDoc = await getDoc(doc($db, 'files', fileId))
      if (fileDoc.exists()) {
        const fileData = fileDoc.data()
        // Base64 데이터를 data URL로 변환
        const dataUrl = `data:${fileData.fileType};base64,${fileData.base64Data}`
        documentViewerUrl.value = dataUrl
      } else {
        console.error('파일을 찾을 수 없습니다:', fileId)
        alert('파일을 찾을 수 없습니다.')
      }
    } else {
      // 일반 URL인 경우
      documentViewerUrl.value = url
    }
  } catch (error) {
    console.error('파일 로드 실패:', error)
    alert('파일을 불러올 수 없습니다.')
  }
}

// 이미지 파일인지 확인
const isImageFile = (url: string) => {
  return url.startsWith('data:image/') || url.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)
}

// 로그아웃 함수
const handleLogout = async () => {
  try {
    await user.logout()
    navigateTo('/')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>