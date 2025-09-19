import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { FirestoreService } from '~/lib/services/firestore'
import type { Request } from '~/lib/types'

export const useRequestsStore = defineStore('requests', () => {
  const requests = ref<Request[]>([])
  const currentRequest = ref<Request | null>(null)
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
  const pendingRequests = computed(() => 
    requests.value.filter(req => req.status === 'pending')
  )
  
  const inProgressRequests = computed(() => 
    requests.value.filter(req => req.status === 'in_progress')
  )
  
  const completedRequests = computed(() => 
    requests.value.filter(req => req.status === 'completed')
  )

  // Actions
  async function fetchAllRequests() {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      requests.value = await service.getAllRequests()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch requests'
      console.error('Error fetching requests:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchRequestsByCustomer(customerId: string) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      requests.value = await service.getRequestsByCustomer(customerId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch customer requests'
      console.error('Error fetching customer requests:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchRequest(requestId: string) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      currentRequest.value = await service.getRequest(requestId)
      if (!currentRequest.value) {
        error.value = 'Request not found'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch request'
      console.error('Error fetching request:', err)
    } finally {
      loading.value = false
    }
  }

  async function createRequest(requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      const requestId = await service.createRequest(requestData)
      
      // Refresh the requests list
      await fetchAllRequests()
      
      return requestId
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create request'
      console.error('Error creating request:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateRequest(requestId: string, requestData: Partial<Request>) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      await service.updateRequest(requestId, requestData)
      
      // Update local state
      const index = requests.value.findIndex(req => req.id === requestId)
      if (index !== -1) {
        requests.value[index] = { ...requests.value[index], ...requestData }
      }
      
      if (currentRequest.value?.id === requestId) {
        currentRequest.value = { ...currentRequest.value, ...requestData }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update request'
      console.error('Error updating request:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteRequest(requestId: string) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      await service.deleteRequest(requestId)
      
      // Remove from local state
      requests.value = requests.value.filter(req => req.id !== requestId)
      
      if (currentRequest.value?.id === requestId) {
        currentRequest.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete request'
      console.error('Error deleting request:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentRequest() {
    currentRequest.value = null
  }

  return {
    // State
    requests,
    currentRequest,
    loading,
    error,
    
    // Computed
    pendingRequests,
    inProgressRequests,
    completedRequests,
    
    // Actions
    fetchAllRequests,
    fetchRequestsByCustomer,
    fetchRequest,
    createRequest,
    updateRequest,
    deleteRequest,
    clearError,
    clearCurrentRequest,
  }
})




