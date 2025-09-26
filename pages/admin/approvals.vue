<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <NuxtLink to="/admin" class="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">응답하라 창고</NuxtLink>
            <div class="flex space-x-4">
              <NuxtLink to="/admin/requests" class="text-gray-700 hover:text-gray-900">요청 관리</NuxtLink>
              <NuxtLink to="/admin/bids" class="text-gray-700 hover:text-gray-900">견적 관리</NuxtLink>
              <NuxtLink to="/admin/partners" class="text-gray-700 hover:text-gray-900">파트너 관리</NuxtLink>
              <NuxtLink to="/admin/approvals" class="text-blue-600 font-medium relative">
                파트너 승인
                <!-- 새로운 승인 요청 알림 점 -->
                <span 
                  v-if="pendingPartnersCount > 0"
                  class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"
                ></span>
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-700">{{ userProfile?.name || '관리자' }}</span>
            <button @click="logout" class="text-gray-700 hover:text-gray-900">로그아웃</button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">파트너 승인 관리</h2>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ stats.pending }}</div>
          <div class="text-sm text-gray-600">승인 대기</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.approved }}</div>
          <div class="text-sm text-gray-600">승인됨</div>
        </div>
        <div class="card text-center">
          <div class="text-2xl font-bold text-red-600">{{ stats.rejected }}</div>
          <div class="text-sm text-gray-600">거절됨</div>
        </div>
      </div>

      <!-- Pending Approvals Table -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">승인 대기 중인 파트너</h3>
        <BaseTable
          :data="pendingPartners"
          :columns="columns"
          :loading="loading"
          :show-actions="true"
        >
          <template #cell-status="{ value }">
            <span class="text-yellow-600 font-medium">승인 대기</span>
          </template>

          <template #cell-createdAt="{ value }">
            {{ formatDate(value) }}
          </template>

          <template #cell-businessLicense="{ value, row }">
            <div v-if="value && value.downloadUrl" class="flex justify-center">
              <img 
                :src="getThumbnailUrl(value.downloadUrl)"
                @click="viewDocument(value.downloadUrl)"
                class="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-gray-200"
                :alt="value.fileName || '사업자등록증'"
                @error="handleImageError"
              />
            </div>
            <div v-else class="text-gray-400 text-sm">없음</div>
          </template>

          <template #actions="{ row }">
            <button
              @click="viewPartner(row)"
              class="text-blue-600 hover:text-blue-800 mr-2"
            >
              상세보기
            </button>
            <button
              @click="approvePartner(row)"
              class="text-green-600 hover:text-green-800 mr-2"
            >
              승인
            </button>
            <button
              @click="rejectPartner(row)"
              class="text-red-600 hover:text-red-800"
            >
              거절
            </button>
          </template>
        </BaseTable>
      </div>
    </div>

    <!-- Partner Detail Modal -->
    <div v-if="selectedPartner" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">파트너 상세 정보</h2>
            <button 
              @click="selectedPartner = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <span class="text-2xl">×</span>
            </button>
          </div>

          <!-- Partner Info -->
          <div v-if="selectedPartner" class="space-y-6">
            <!-- Basic Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">기본 정보</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm text-gray-600">회사명</label>
                  <p class="font-semibold text-gray-900">{{ selectedPartner.companyName }}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">담당자</label>
                  <p class="font-semibold text-gray-900">{{ selectedPartner.name }}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">전화번호</label>
                  <p class="font-semibold text-gray-900">{{ selectedPartner.phone }}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">신청일</label>
                  <p class="font-semibold text-gray-900">{{ formatDate(selectedPartner.createdAt) }}</p>
                </div>
              </div>
            </div>

            <!-- KYC Documents -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">KYC 서류</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- 사업자등록증 -->
                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-2">사업자등록증</h4>
                  <div v-if="selectedPartner.kycDocuments?.businessLicense" class="space-y-2">
                    <p class="text-sm text-gray-600">{{ selectedPartner.kycDocuments.businessLicense.fileName }}</p>
                    <div class="flex space-x-2">
                      <button 
                        @click="viewDocument(selectedPartner.kycDocuments.businessLicense.downloadUrl)"
                        class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        보기
                      </button>
                      <a 
                        :href="selectedPartner.kycDocuments.businessLicense.downloadUrl"
                        target="_blank"
                        class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        다운로드
                      </a>
                    </div>
                  </div>
                  <p v-else class="text-sm text-red-600">서류 없음</p>
                </div>

                <!-- 보험증권 -->
                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-2">보험증권</h4>
                  <div v-if="selectedPartner.kycDocuments?.insurancePolicy" class="space-y-2">
                    <p class="text-sm text-gray-600">{{ selectedPartner.kycDocuments.insurancePolicy.fileName }}</p>
                    <div class="flex space-x-2">
                      <button 
                        @click="viewDocument(selectedPartner.kycDocuments.insurancePolicy.downloadUrl)"
                        class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        보기
                      </button>
                      <a 
                        :href="selectedPartner.kycDocuments.insurancePolicy.downloadUrl"
                        target="_blank"
                        class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        다운로드
                      </a>
                    </div>
                  </div>
                  <p v-else class="text-sm text-red-600">서류 없음</p>
                </div>

                <!-- 창고 사진 -->
                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-2">창고 사진</h4>
                  <div v-if="selectedPartner.kycDocuments?.warehousePhoto" class="space-y-2">
                    <p class="text-sm text-gray-600">{{ selectedPartner.kycDocuments.warehousePhoto.fileName }}</p>
                    <div class="flex space-x-2">
                      <button 
                        @click="viewDocument(selectedPartner.kycDocuments.warehousePhoto.downloadUrl)"
                        class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        보기
                      </button>
                      <a 
                        :href="selectedPartner.kycDocuments.warehousePhoto.downloadUrl"
                        target="_blank"
                        class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        다운로드
                      </a>
                    </div>
                  </div>
                  <p v-else class="text-sm text-red-600">서류 없음</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 거절된 사용자 정보 표시 -->
          <div v-if="selectedPartner.approvalStatus === 'rejected'" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center mb-2">
              <svg class="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h4 class="text-lg font-medium text-red-800">승인거부된 사용자입니다.</h4>
            </div>
            <div v-if="selectedPartner.rejectionReason" class="mt-2">
              <p class="text-sm text-red-700"><strong>거절 사유:</strong> {{ selectedPartner.rejectionReason }}</p>
            </div>
            <div v-if="selectedPartner.rejectedAt" class="mt-2">
              <p class="text-sm text-red-600"><strong>거절 일시:</strong> {{ new Date(selectedPartner.rejectedAt).toLocaleString() }}</p>
            </div>
            <div class="mt-4 flex justify-end">
              <button 
                @click="deletePartner(selectedPartner)"
                class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                삭제
              </button>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button 
              @click="selectedPartner = null"
              class="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
            <button 
              v-if="selectedPartner.approvalStatus !== 'rejected'"
              @click="rejectPartner(selectedPartner)"
              class="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              거절
            </button>
            <button 
              v-if="selectedPartner.approvalStatus !== 'rejected'"
              @click="approvePartner(selectedPartner)"
              class="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              승인
            </button>
          </div>
        </div>
      </div>
    </div>

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
import { onMounted } from 'vue'

definePageMeta({
  middleware: 'role-admin'
})

const { userProfile, logout } = useUserStore()

const loading = ref(false)
const selectedPartner = ref<any>(null)
const documentViewerUrl = ref<string | null>(null)
const thumbnailCache = ref<Record<string, string>>({})

const stats = ref({
  pending: 5,
  approved: 18,
  rejected: 2
})

const pendingPartners = ref<any[]>([])

// 실제 Firestore에서 파트너 데이터 가져오기
const loadPendingPartners = async () => {
  loading.value = true
  try {
    const { $db } = useNuxtApp()
    const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore')
    
    // approvalStatus가 'pending'인 파트너들 가져오기
    const q = query(
      collection($db, 'users'),
      where('role', '==', 'partner'),
      where('approvalStatus', '==', 'pending')
    )
    
    const querySnapshot = await getDocs(q)
    const partners: any[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      partners.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
      })
    })
    
    // 생성일 기준으로 정렬
    partners.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime() // 최신순
    })
    
    pendingPartners.value = partners
    console.log('승인 대기 파트너 목록:', partners)
    
    // 통계 업데이트
    stats.value.pending = partners.length
    
    // 썸네일 미리 로드
    await preloadThumbnails(partners)
    
  } catch (error) {
    console.error('파트너 목록 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

const columns = [
  { key: 'name', label: '이름' },
  { key: 'companyName', label: '회사' },
  { key: 'phone', label: '전화번호' },
  { key: 'businessLicense', label: '사업자등록증' },
  { key: 'status', label: '상태' },
  { key: 'createdAt', label: '신청일', format: 'date' },
]

const approvePartner = async (partner: any) => {
  if (confirm('이 파트너를 승인하시겠습니까?')) {
    try {
      console.log('Approving partner:', partner.id)
      
      // Firestore에서 파트너 상태 업데이트
      const { doc, updateDoc } = await import('firebase/firestore')
      const { $db } = useNuxtApp()
      
      await updateDoc(doc($db, 'users', partner.id), {
        approvalStatus: 'approved',
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      
      // Remove from pending list
      const index = pendingPartners.value.findIndex(p => p.id === partner.id)
      if (index > -1) {
        pendingPartners.value.splice(index, 1)
        stats.value.pending--
        stats.value.approved++
      }
      
      // Close modal if open
      if (selectedPartner.value && selectedPartner.value.id === partner.id) {
        selectedPartner.value = null
      }
      
      alert('파트너가 승인되었습니다.')
      console.log('Partner approved successfully:', partner.id)
      
    } catch (error) {
      console.error('Error approving partner:', error)
      alert('파트너 승인에 실패했습니다. 다시 시도해주세요.')
    }
  }
}

const rejectPartner = async (partner: any) => {
  // 거절 사유 입력 받기
  const rejectionReason = prompt('승인거부 사유를 작성해주세요:')
  
  if (!rejectionReason || rejectionReason.trim() === '') {
    alert('거절 사유를 입력해주세요.')
    return
  }
  
  if (confirm('이 파트너를 거절하시겠습니까?')) {
    try {
      console.log('Rejecting partner:', partner.id, 'Reason:', rejectionReason)
      
      // Firestore에서 파트너 상태 업데이트
      const { doc, updateDoc } = await import('firebase/firestore')
      const { $db } = useNuxtApp()
      
      await updateDoc(doc($db, 'users', partner.id), {
        approvalStatus: 'rejected',
        rejectionReason: rejectionReason,
        rejectedAt: new Date(),
        updatedAt: new Date()
      })
      
      // Remove from pending list
      const index = pendingPartners.value.findIndex(p => p.id === partner.id)
      if (index > -1) {
        pendingPartners.value.splice(index, 1)
        stats.value.pending--
        stats.value.rejected++
      }
      
      alert('파트너가 거절되었습니다.')
      console.log('Partner rejected successfully:', partner.id)
      
    } catch (error) {
      console.error('Error rejecting partner:', error)
      alert('파트너 거절에 실패했습니다. 다시 시도해주세요.')
    }
  }
}

const viewPartner = (partner: any) => {
  selectedPartner.value = partner
}

const deletePartner = async (partner: any) => {
  if (confirm('이 파트너를 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    try {
      console.log('Deleting partner:', partner.id)
      
      // Firestore에서 파트너 완전 삭제
      const { doc, deleteDoc } = await import('firebase/firestore')
      const { $db } = useNuxtApp()
      
      await deleteDoc(doc($db, 'users', partner.id))
      
      // Remove from pending list
      const index = pendingPartners.value.findIndex(p => p.id === partner.id)
      if (index > -1) {
        pendingPartners.value.splice(index, 1)
        stats.value.pending--
      }
      
      // Close modal
      selectedPartner.value = null
      
      alert('파트너가 삭제되었습니다.')
      console.log('Partner deleted successfully:', partner.id)
      
    } catch (error) {
      console.error('Error deleting partner:', error)
      alert('파트너 삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }
}

const viewDocument = async (url: string) => {
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

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ko-KR')
}

const isImageFile = (url: string) => {
  return url.startsWith('data:image/') || url.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)
}

// 썸네일 URL 생성 (동기 함수)
const getThumbnailUrl = (url: string) => {
  if (url.startsWith('firestore://files/')) {
    // 캐시에서 확인
    if (thumbnailCache.value[url]) {
      return thumbnailCache.value[url]
    }
    // 기본 이미지 표시
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'
  }
  return url
}

// 썸네일 미리 로드
const preloadThumbnails = async (partners: any[]) => {
  for (const partner of partners) {
    if (partner.kycDocuments?.businessLicense?.downloadUrl) {
      const url = partner.kycDocuments.businessLicense.downloadUrl
      if (url.startsWith('firestore://files/') && !thumbnailCache.value[url]) {
        try {
          const fileId = url.replace('firestore://files/', '')
          const { $db } = useNuxtApp()
          const { doc, getDoc } = await import('firebase/firestore')
          
          const fileDoc = await getDoc(doc($db, 'files', fileId))
          if (fileDoc.exists()) {
            const fileData = fileDoc.data()
            thumbnailCache.value[url] = `data:${fileData.fileType};base64,${fileData.base64Data}`
          }
        } catch (error) {
          console.error('썸네일 로드 실패:', error)
        }
      }
    }
  }
}

// 이미지 로드 에러 처리
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRkY1RTVFIi8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBmaWxsPSIjRkY2QjZCIi8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'
}

// 페이지 로드 시 파트너 목록 가져오기
onMounted(() => {
  loadPendingPartners()
})
</script>





