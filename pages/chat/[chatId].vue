<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <BaseNavbar />

    <!-- Header -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <!-- Back Button -->
        <div class="flex items-center mb-4">
          <NuxtLink 
            to="/chat-list"
            class="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            채팅 목록
          </NuxtLink>
        </div>
        
        <!-- 업체 정보 및 견적 요약 -->
        <div v-if="chatInfo" class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div class="flex items-center space-x-4">
            <!-- Quote Icon -->
            <span class="text-3xl">📋</span>
            
            <!-- Company/Customer Info -->
            <div class="flex-1 min-w-0">
              <h2 class="text-lg font-bold text-gray-900 truncate">
                {{ user.role === 'customer' ? chatInfo.partnerCompany : chatInfo.customerName }}
              </h2>
              <p v-if="chatInfo.quote" class="text-sm text-gray-600">
                보관비 월 {{ formatPrice(chatInfo.quote.storageFee) }}원
              </p>
            </div>
            
            <!-- Accept Button -->
            <button 
              v-if="user.role === 'customer' && chatInfo.quote"
              @click="acceptQuote"
              class="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              견적 수락하기
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="max-w-4xl mx-auto px-4 py-4">
      <div
        ref="messagesContainer"
        class="h-96 overflow-y-auto space-y-3 mb-4 p-4 bg-white rounded-2xl border border-gray-100"
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
          class="flex"
          :class="message.senderId === user.currentUser?.uid ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl flex items-end space-x-2"
            :class="message.senderId === user.currentUser?.uid 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-900'"
          >
            <p class="text-sm flex-1">{{ message.text }}</p>
            <div class="flex items-center space-x-1">
              <span class="text-xs opacity-70">{{ formatTime(message.createdAt) }}</span>
              <!-- Read Status -->
              <span 
                v-if="message.senderId === user.currentUser?.uid && message.readStatus === 'read'"
                class="text-xs opacity-70"
              >
                ✓
              </span>
              <span 
                v-else-if="message.senderId === user.currentUser?.uid && message.readStatus === 'delivered'"
                class="text-xs opacity-70"
              >
                1
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="bg-white rounded-2xl border border-gray-100 p-4">
        <form @submit.prevent="sendMessage" class="flex space-x-3">
          <input
            v-model="newMessage"
            type="text"
            placeholder="메시지를 입력하세요..."
            class="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="sending"
          />
          <button
            type="submit"
            :disabled="!newMessage.trim() || sending"
            class="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
const loadChatInfo = async (requestId: string, partnerId: string, customerId: string) => {
  try {
    const { FirestoreService } = await import('~/lib/services/firestore')
    const firestoreService = new FirestoreService($db)
    
    // 파트너 정보 로드
    const partner = await firestoreService.getUser(partnerId)
    
    // 고객 정보 로드
    const customer = await firestoreService.getUser(customerId)
    
    // 해당 요청에 대한 파트너의 견적 로드
    const quotes = await firestoreService.getWarehouseQuotesByPartner(partnerId)
    const quote = quotes.find(q => q.requestId === requestId)
    
    chatInfo.value = {
      partnerCompany: partner?.companyName || '알 수 없음',
      partnerName: partner?.name || '알 수 없음',
      customerName: customer?.name || '알 수 없음',
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

// 견적 수락 처리
const acceptQuote = async () => {
  if (!chatInfo.value?.quote) return
  
  try {
    const { FirestoreService } = await import('~/lib/services/firestore')
    const firestoreService = new FirestoreService($db)
    
    // 견적서 상태를 'accepted'로 업데이트
    await firestoreService.updateWarehouseQuote(chatInfo.value.quote.id, {
      status: 'accepted',
      acceptedAt: new Date()
    })
    
    alert('견적서가 수락되었습니다!')
    
          // 채팅 정보 다시 로드
          const parts = chatId.split('_')
          if (parts.length >= 3) {
            const [requestId, customerId, partnerId] = parts
            await loadChatInfo(requestId, partnerId, customerId)
          }
  } catch (error) {
    console.error('견적 수락 실패:', error)
    alert('견적 수락에 실패했습니다.')
  }
}

// 마지막 읽은 시간 업데이트
const updateLastReadAt = async () => {
  try {
    const currentUserId = user.currentUser?.uid
    if (!currentUserId) return
    
    const chatRef = doc($db, 'chats', chatId)
    const now = new Date()
    
    // 현재 사용자의 lastReadAt 업데이트
    await setDoc(chatRef, {
      [`lastReadAt_${currentUserId}`]: now
    }, { merge: true })
    
    console.log('마지막 읽은 시간 업데이트됨:', now)
  } catch (error) {
    console.error('마지막 읽은 시간 업데이트 실패:', error)
  }
}

// 메시지 읽음 상태 업데이트
const markMessagesAsRead = async (messages: any[]) => {
  try {
    const currentUserId = user.currentUser?.uid
    if (!currentUserId) return
    
    // 상대방이 보낸 메시지 중 아직 읽지 않은 메시지들을 찾아서 읽음으로 표시
    const unreadMessages = messages.filter(msg => 
      msg.senderId !== currentUserId && msg.readStatus !== 'read'
    )
    
    for (const message of unreadMessages) {
      const messageRef = doc($db, 'chats', chatId, 'messages', message.id)
      await setDoc(messageRef, {
        readStatus: 'read',
        readAt: new Date()
      }, { merge: true })
    }
  } catch (error) {
    console.error('메시지 읽음 상태 업데이트 실패:', error)
  }
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
          await loadChatInfo(requestId, partnerId, customerId)

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
    unsubscribe = onSnapshot(q, async (snapshot) => {
      const loaded: any[] = []
      snapshot.forEach((doc) => loaded.push({ id: doc.id, ...doc.data() }))
      messages.value = loaded

      // 스크롤 맨 아래로
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
      
      // 메시지를 읽었으므로 lastReadAt 업데이트
      await updateLastReadAt()
      
      // 상대방이 보낸 메시지들을 읽음으로 표시
      await markMessagesAsRead(loaded)
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
      createdAt: serverTimestamp(),
      readStatus: 'delivered' // 기본값: 전송됨
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
