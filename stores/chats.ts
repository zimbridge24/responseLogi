import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { FirestoreService } from '~/lib/services/firestore'
import { where } from 'firebase/firestore'
import type { Chat, ChatMessage } from '~/lib/types'

export const useChatsStore = defineStore('chats', () => {
  const chats = ref<Chat[]>([])
  const currentChat = ref<Chat | null>(null)
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  let firestoreService: FirestoreService | null = null

  // Initialize Firestore service when needed
  const getFirestoreService = () => {
    if (!firestoreService) {
      const { $db } = useNuxtApp()
      firestoreService = new FirestoreService($db)
    }
    return firestoreService
  }

  // Computed properties
  const unreadChats = computed(() => 
    chats.value.filter(chat => chat.lastMessageAt && !chat.lastMessage?.includes('You:'))
  )

  // 전체 읽지 않은 메시지 수 계산
  const totalUnreadCount = computed(() => 
    chats.value.reduce((total, chat) => total + (chat.unreadCount || 0), 0)
  )

  // Actions
  async function fetchChatByRequest(requestId: string) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      currentChat.value = await service.getChatByRequest(requestId)
      
      if (currentChat.value) {
        await fetchMessages(currentChat.value.id)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch chat'
      console.error('Error fetching chat:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchMessages(chatId: string) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      messages.value = await service.getChatMessages(chatId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch messages'
      console.error('Error fetching messages:', err)
    } finally {
      loading.value = false
    }
  }

  async function createChat(chatData: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      const chatId = await service.createChat(chatData)
      
      // Refresh the chat
      await fetchChatByRequest(chatData.requestId)
      
      return chatId
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create chat'
      console.error('Error creating chat:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(messageData: Omit<ChatMessage, 'id' | 'createdAt'>) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      const messageId = await service.createChatMessage(messageData)
      
      // Refresh messages
      await fetchMessages(messageData.chatId)
      
      return messageId
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send message'
      console.error('Error sending message:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getOrCreateChat(requestId: string, participants: string[]) {
    // First try to get existing chat
    await fetchChatByRequest(requestId)
    
    if (!currentChat.value) {
      // Create new chat if it doesn't exist
      await createChat({
        requestId,
        participants,
      })
    }
    
    return currentChat.value
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentChat() {
    currentChat.value = null
    messages.value = []
  }

  // 채팅 목록 가져오기
  async function fetchChats(userId: string, userRole: string) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      let userChats
      
      if (userRole === 'customer') {
        userChats = await service.getChats([
          where('customerId', '==', userId)
        ])
      } else if (userRole === 'partner') {
        userChats = await service.getChats([
          where('partnerId', '==', userId)
        ])
      } else {
        userChats = []
      }
      
      // 메시지가 있는 채팅만 필터링하고 상대방 정보 추가
      const chatsWithMessages = []
      for (const chat of userChats) {
        try {
          const messages = await service.getChatMessages(chat.id)
          if (messages.length > 0) {
            // 상대방 정보 추가
            const otherUserId = userRole === 'customer' ? chat.partnerId : chat.customerId
            const otherUser = await service.getUser(otherUserId)
            chat.otherUserName = otherUser?.name || '알 수 없음'
            
            // 마지막 메시지 정보 추가
            const lastMessage = messages[messages.length - 1]
            chat.lastMessage = lastMessage.text
            chat.lastMessageAt = lastMessage.createdAt
            
            // 읽지 않은 메시지 수 계산
            const lastReadAt = chat[`lastReadAt_${userId}`]
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
            
            const unreadMessages = messages.filter(msg => {
              if (msg.senderId === userId) return false
              if (!lastReadAtDate) return true
              
              const messageTime = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt)
              return messageTime > lastReadAtDate
            })
            
            chat.unreadCount = unreadMessages.length
            chatsWithMessages.push(chat)
          }
        } catch (error) {
          console.error('채팅 메시지 확인 실패:', error)
        }
      }
      
      chats.value = chatsWithMessages
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch chats'
      console.error('Error fetching chats:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    chats,
    currentChat,
    messages,
    loading,
    error,
    
    // Computed
    unreadChats,
    totalUnreadCount,
    
    // Actions
    fetchChatByRequest,
    fetchMessages,
    createChat,
    sendMessage,
    getOrCreateChat,
    fetchChats,
    clearError,
    clearCurrentChat,
  }
})





