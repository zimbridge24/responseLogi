<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <!-- 상단 네비게이션 -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/chat-list" class="text-gray-500 hover:text-gray-700">← 뒤로가기</NuxtLink>
            <NuxtLink to="/" class="text-gray-500 hover:text-gray-700">🏠 홈</NuxtLink>
          </div>
          <h1 class="text-xl font-semibold text-gray-900">채팅방</h1>
          <div class="w-8"></div> <!-- 균형을 위한 빈 공간 -->
        </div>
        
        <!-- 업체 정보 및 견적 요약 -->
        <div v-if="chatInfo" class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 font-semibold">🏢</span>
                </div>
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">{{ chatInfo.partnerCompany }}</h2>
                  <p class="text-sm text-gray-600">{{ chatInfo.partnerName }}</p>
                </div>
              </div>
              
              <!-- 견적 요약 정보 -->
              <div v-if="chatInfo.quote" class="mt-3">
                <div class="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                  <span class="mr-2">📦</span>
                  물류4 (보관비 월 {{ formatPrice(chatInfo.quote.storageFee) }}원)
                </div>
              </div>
            </div>
            
            <!-- 전화걸기 버튼 (모바일용) -->
            <div class="ml-4">
              <a 
                :href="`tel:${chatInfo.partnerPhone}`"
                class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <span class="mr-2">📞</span>
                전화걸기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="max-w-4xl mx-auto px-4 py-4">
      <div
        ref="messagesContainer"
        class="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-white rounded-lg shadow-sm"
      >
        <div v-if="loading" class="flex justify-center items-center h-full">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="messages.length === 0" class="flex justify-center items-center h-full text-gray-500">
          <p>아직 메시지가 없습니다. 첫 메시지를 보내보세요!</p>
        </div>

        <div
          v-for="message in messages"
          :key="message.id"
          :style="{
            display: 'flex',
            justifyContent: message.senderId === user.currentUser?.uid ? 'flex-end' : 'flex-start',
            marginBottom: '12px'
          }"
        >
          <div
            :style="{
              backgroundColor: message.senderId === user.currentUser?.uid ? '#2563eb' : '#e5e7eb',
              color: message.senderId === user.currentUser?.uid ? 'white' : 'black',
              maxWidth: '300px',
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px'
            }"
          >
            <p style="margin: 0; font-size: '14px'; flex: 1;">{{ message.text }}</p>
            <span style="font-size: '12px'; opacity: 0.7; whiteSpace: 'nowrap';">{{ formatTime(message.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <form @submit.prevent="sendMessage" class="flex space-x-2">
          <input
            v-model="newMessage"
            type="text"
            placeholder="메시지를 입력하세요..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="sending"
          />
          <button
            type="submit"
            :disabled="!newMessage.trim() || sending"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ sending ? '전송중...' : '전송' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { doc, setDoc, getDoc, addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'

// 미들웨어 제거 - 페이지에서 직접 로그인 체크

const route = useRoute()
const chatId = route.params.chatId as string
const user = useUserStore()
const { $db } = useNuxtApp()

const loading = ref(true)
const sending = ref(false)
const messages = ref<any[]>([])
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const chatInfo = ref<any>(null)
let unsubscribe: (() => void) | null = null

// 채팅 정보 로드 (업체 정보 및 견적)
const loadChatInfo = async (requestId: string, partnerId: string) => {
  try {
    const { FirestoreService } = await import('~/lib/services/firestore')
    const firestoreService = new FirestoreService($db)
    
    // 파트너 정보 로드
    const partner = await firestoreService.getUser(partnerId)
    
    // 해당 요청에 대한 파트너의 견적 로드
    const quotes = await firestoreService.getWarehouseQuotesByPartner(partnerId)
    const quote = quotes.find(q => q.requestId === requestId)
    
    chatInfo.value = {
      partnerCompany: partner?.companyName || '알 수 없음',
      partnerName: partner?.name || '알 수 없음',
      partnerPhone: partner?.phone || '',
      quote: quote || null
    }
  } catch (error) {
    console.error('채팅 정보 로드 실패:', error)
  }
}

// 가격 포맷팅
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR').format(price)
}

// 채팅 로드
const loadChat = async () => {
  loading.value = true
  try {
    // chatId 파싱
    const parts = chatId.split('_')
    if (parts.length < 3) {
      alert('잘못된 채팅방 ID입니다.')
      return await navigateTo('/chat-list')
    }
    const [requestId, customerId, partnerId] = parts

    // 채팅 정보 로드
    await loadChatInfo(requestId, partnerId)

    // chats/{chatId} 문서 확인
    const chatRef = doc($db, 'chats', chatId)
    const chatSnap = await getDoc(chatRef)

    if (!chatSnap.exists()) {
      // 없으면 생성
      await setDoc(chatRef, {
        requestId,
        customerId,
        partnerId,
        createdAt: serverTimestamp()
      })
    }

    // 메시지 구독
    const messagesRef = collection($db, 'chats', chatId, 'messages')
    const q = query(messagesRef, orderBy('createdAt', 'asc'))
    unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: any[] = []
      snapshot.forEach((doc) => loaded.push({ id: doc.id, ...doc.data() }))
      messages.value = loaded

      // 스크롤 맨 아래로
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    })
  } catch (e) {
    console.error('채팅 로드 실패:', e)
    alert('채팅을 불러오지 못했습니다.')
  } finally {
    loading.value = false
  }
}

// 메시지 전송
const sendMessage = async () => {
  if (!newMessage.value.trim() || !user.currentUser?.uid || sending.value) return
  sending.value = true
  try {
    const messagesRef = collection($db, 'chats', chatId, 'messages')
    await addDoc(messagesRef, {
      senderId: user.currentUser.uid,
      text: newMessage.value.trim(),
      createdAt: serverTimestamp()
    })
    newMessage.value = ''
  } catch (e) {
    console.error('메시지 전송 실패:', e)
    alert('메시지 전송에 실패했습니다.')
  } finally {
    sending.value = false
  }
}

const formatTime = (date: any) => {
  if (!date) return ''
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  return dateObj.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  console.log('채팅 페이지 마운트됨, chatId:', chatId)
  
  // 인증 상태가 준비될 때까지 대기
  let attempts = 0
  const maxAttempts = 50 // 5초 (100ms * 50)
  
  while (!user.authReady && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }
  
  console.log('현재 사용자 상태:', {
    isLoggedIn: user.isLoggedIn,
    role: user.role,
    currentUser: user.currentUser,
    userProfile: user.user,
    authReady: user.authReady
  })
  
  // 로그인 체크
  if (user.isLoggedIn && user.role) {
    console.log('사용자 로그인 확인됨, 채팅 로드 시작')
    await loadChat()
  } else {
    console.log('로그인되지 않음, 로그인 페이지로 이동')
    await navigateTo('/login')
  }
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>
