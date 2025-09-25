<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <BaseNavbar />

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">채팅</h1>
        <p class="text-gray-600 text-sm">
          {{ user.role === 'customer' ? '파트너들과의 대화를 확인하세요' : '고객들과의 대화를 확인하세요' }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="chats.length === 0" class="text-center py-16">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl text-gray-400">💬</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">아직 채팅이 없습니다</h3>
        <p class="text-gray-600 text-sm">메시지를 주고받은 채팅이 여기에 표시됩니다</p>
      </div>

      <!-- Chat List -->
      <div v-else class="space-y-2">
        <div 
          v-for="chat in chats" 
          :key="chat.id"
          @click="openChat(chat)"
          class="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <!-- Quote Icon -->
              <span class="text-2xl">📋</span>
              
              <!-- Chat Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <h3 class="text-base font-semibold text-gray-900 truncate">
                    {{ chat.otherUserName || '알 수 없음' }}
                  </h3>
                  <!-- New Message Badge -->
                  <span 
                    v-if="chat.unreadCount > 0" 
                    class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full flex-shrink-0"
                  >
                    {{ chat.unreadCount > 9 ? '9+' : chat.unreadCount }}
                  </span>
                </div>
                <p v-if="chat.lastMessage" class="text-sm text-gray-600 truncate mt-1">
                  {{ chat.lastMessage }}
                </p>
                <p v-else class="text-sm text-gray-400 mt-1">
                  아직 메시지가 없습니다
                </p>
              </div>
            </div>
            
            <!-- Time -->
            <div class="ml-3 flex-shrink-0">
              <span class="text-xs text-gray-500">
                {{ chat.lastMessageAt ? formatTime(chat.lastMessageAt) : '' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { FirestoreService } from '~/lib/services/firestore'
import { where, collection, query, onSnapshot } from 'firebase/firestore'

// 로그인 체크
const user = useUserStore()

// Initialize auth listener
user.initializeAuth()

onMounted(async () => {
  console.log('채팅 목록 페이지 마운트됨')
  
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
  
  if (user.isLoggedIn && user.role) {
    console.log('사용자 로그인 확인됨, 채팅 목록 로드 시작')
    await loadChats()
  } else {
    console.log('로그인되지 않음, 로그인 페이지로 이동')
    navigateTo('/login')
  }
})

const loading = ref(true)
const chats = ref<any[]>([])
const unreadCounts = ref<Map<string, number>>(new Map()) // chatId -> unread count

// 실시간 채팅 목록 구독
let unsubscribeChats: (() => void) | null = null

// 읽지 않은 메시지 수 계산
const calculateUnreadCount = async (chatId: string, lastReadAt?: Date) => {
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // 마지막으로 읽은 시간 이후의 메시지 수 계산
    const messages = await firestoreService.getChatMessages(chatId)
    const currentUserId = user.currentUser?.uid
    
    if (!currentUserId) return 0
    
    if (!lastReadAt) {
      // 마지막으로 읽은 시간이 없으면 모든 메시지가 읽지 않은 것으로 간주
      const unreadMessages = messages.filter(msg => msg.senderId !== currentUserId)
      return unreadMessages.length
    }
    
    // 마지막으로 읽은 시간 이후의 메시지 중 내가 보내지 않은 메시지 수
    const unreadMessages = messages.filter(msg => {
      if (msg.senderId === currentUserId) return false
      
      const messageTime = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt)
      return messageTime > lastReadAt
    })
    
    return unreadMessages.length
  } catch (error) {
    console.error('읽지 않은 메시지 수 계산 실패:', error)
    return 0
  }
}

// 채팅 목록 로드
const loadChats = async () => {
  loading.value = true
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // 사용자 역할에 따라 다른 필터 적용
    let userChats
    if (user.role === 'customer') {
      // 고객인 경우: customerId가 현재 사용자 ID인 채팅들
      userChats = await firestoreService.getChats([
        where('customerId', '==', user.currentUser?.uid)
      ])
    } else if (user.role === 'partner') {
      // 파트너인 경우: partnerId가 현재 사용자 ID인 채팅들
      userChats = await firestoreService.getChats([
        where('partnerId', '==', user.currentUser?.uid)
      ])
    } else {
      // 관리자나 기타 역할인 경우 빈 배열
      userChats = []
    }
    
    console.log('로드된 채팅 수:', userChats.length)
    
    // 메시지가 있는 채팅만 필터링
    const chatsWithMessages = []
    for (const chat of userChats) {
      try {
        // 채팅의 메시지 개수 확인
        const messages = await firestoreService.getChatMessages(chat.id)
        if (messages.length > 0) {
          // 상대방 정보 추가
          const otherUserId = user.role === 'customer' ? chat.partnerId : chat.customerId
          const otherUser = await firestoreService.getUser(otherUserId)
          chat.otherUserName = otherUser?.name || '알 수 없음'
          
          // 마지막 메시지 정보 추가
          const lastMessage = messages[messages.length - 1]
          chat.lastMessage = lastMessage.text
          chat.lastMessageAt = lastMessage.createdAt
          
          // 읽지 않은 메시지 수 계산
          const currentUserId = user.currentUser?.uid
          const lastReadAt = currentUserId ? chat[`lastReadAt_${currentUserId}`] : null
          const unreadCount = await calculateUnreadCount(chat.id, lastReadAt)
          chat.unreadCount = unreadCount
          unreadCounts.value.set(chat.id, unreadCount)
          
          chatsWithMessages.push(chat)
        }
      } catch (error) {
        console.error('채팅 메시지 확인 실패:', error)
      }
    }
    
    console.log('메시지가 있는 채팅 수:', chatsWithMessages.length)
    chats.value = chatsWithMessages
    
    // 실시간 구독 시작
    startChatsSubscription()
  } catch (error) {
    console.error('채팅 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 실시간 채팅 목록 구독
const startChatsSubscription = async () => {
  try {
    const { $db } = useNuxtApp()
    const firestoreService = new FirestoreService($db)
    
    // 사용자 역할에 따라 다른 필터 적용
    let queryConstraints
    if (user.role === 'customer') {
      queryConstraints = [where('customerId', '==', user.currentUser?.uid)]
    } else if (user.role === 'partner') {
      queryConstraints = [where('partnerId', '==', user.currentUser?.uid)]
    } else {
      return // 관리자나 기타 역할인 경우 구독하지 않음
    }
    
    const chatsRef = collection($db, 'chats')
    const q = query(chatsRef, ...queryConstraints)
    
    unsubscribeChats = onSnapshot(q, async (snapshot) => {
      const updatedChats = []
      for (const doc of snapshot.docs) {
        const chat = { id: doc.id, ...doc.data() }
        
        try {
          // 메시지가 있는지 확인
          const messages = await firestoreService.getChatMessages(chat.id)
          if (messages.length > 0) {
            // 상대방 정보 추가
            const otherUserId = user.role === 'customer' ? chat.partnerId : chat.customerId
            const otherUser = await firestoreService.getUser(otherUserId)
            chat.otherUserName = otherUser?.name || '알 수 없음'
            
            // 마지막 메시지 정보 추가
            const lastMessage = messages[messages.length - 1]
            chat.lastMessage = lastMessage.text
            chat.lastMessageAt = lastMessage.createdAt
            
            // 읽지 않은 메시지 수 계산
            const currentUserId = user.currentUser?.uid
            const lastReadAt = currentUserId ? chat[`lastReadAt_${currentUserId}`] : null
            
            // lastReadAt이 Date 객체인지 확인하고 변환
            let lastReadAtDate = null
            if (lastReadAt) {
              if (lastReadAt.toDate && typeof lastReadAt.toDate === 'function') {
                lastReadAtDate = lastReadAt.toDate()
              } else if (lastReadAt instanceof Date) {
                lastReadAtDate = lastReadAt
              } else {
                lastReadAtDate = new Date(lastReadAt)
              }
            }
            
            const unreadCount = await calculateUnreadCount(chat.id, lastReadAtDate)
            chat.unreadCount = unreadCount
            unreadCounts.value.set(chat.id, unreadCount)
            
            console.log(`채팅 ${chat.id} 읽지 않은 메시지 수:`, unreadCount, 'lastReadAt:', lastReadAtDate)
            
            updatedChats.push(chat)
          }
        } catch (error) {
          console.error('채팅 메시지 확인 실패:', error)
        }
      }
      
      chats.value = updatedChats
    })
  } catch (error) {
    console.error('실시간 구독 설정 실패:', error)
  }
}

// 채팅방 열기
const openChat = async (chat: any) => {
  console.log('채팅방 열기:', chat.id)
  
  // 채팅을 열 때 lastReadAt 업데이트
  try {
    const currentUserId = user.currentUser?.uid
    if (currentUserId) {
      const { $db } = useNuxtApp()
      const { doc, setDoc } = await import('firebase/firestore')
      
      const chatRef = doc($db, 'chats', chat.id)
      const now = new Date()
      
      // 현재 사용자의 lastReadAt 업데이트
      await setDoc(chatRef, {
        [`lastReadAt_${currentUserId}`]: now
      }, { merge: true })
      
      console.log('채팅 읽음 상태 업데이트됨:', now)
      
      // 로컬 상태도 즉시 업데이트
      chat[`lastReadAt_${currentUserId}`] = now
      chat.unreadCount = 0
      unreadCounts.value.set(chat.id, 0)
      
      // chats 배열에서 해당 채팅 찾아서 업데이트
      const chatIndex = chats.value.findIndex(c => c.id === chat.id)
      if (chatIndex !== -1) {
        chats.value[chatIndex].unreadCount = 0
        chats.value[chatIndex][`lastReadAt_${currentUserId}`] = now
      }
      
      // Firestore 업데이트 후 실시간 구독이 트리거될 때까지 잠시 대기
      setTimeout(async () => {
        try {
          // 해당 채팅의 읽지 않은 메시지 수를 다시 계산
          const unreadCount = await calculateUnreadCount(chat.id, now)
          chat.unreadCount = unreadCount
          unreadCounts.value.set(chat.id, unreadCount)
          
          // chats 배열에서도 업데이트
          const chatIndex = chats.value.findIndex(c => c.id === chat.id)
          if (chatIndex !== -1) {
            chats.value[chatIndex].unreadCount = unreadCount
          }
          
          console.log('읽지 않은 메시지 수 재계산 완료:', unreadCount)
        } catch (error) {
          console.error('읽지 않은 메시지 수 재계산 실패:', error)
        }
      }, 500) // 500ms 후 재계산
    }
  } catch (error) {
    console.error('채팅 읽음 상태 업데이트 실패:', error)
  }
  
  navigateTo(`/chat/${chat.id}`)
}

// 날짜 포맷팅
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// 시간 포맷팅
const formatTime = (date: any) => {
  if (!date) return ''
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  return dateObj.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  if (unsubscribeChats) {
    unsubscribeChats()
  }
})
</script>