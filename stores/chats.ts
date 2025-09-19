import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { FirestoreService } from '~/lib/services/firestore'
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

  return {
    // State
    chats,
    currentChat,
    messages,
    loading,
    error,
    
    // Computed
    unreadChats,
    
    // Actions
    fetchChatByRequest,
    fetchMessages,
    createChat,
    sendMessage,
    getOrCreateChat,
    clearError,
    clearCurrentChat,
  }
})




