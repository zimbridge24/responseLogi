import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { FirestoreService } from '~/lib/services/firestore'
import type { Bid } from '~/lib/types'

export const useBidsStore = defineStore('bids', () => {
  const bids = ref<Bid[]>([])
  const currentBid = ref<Bid | null>(null)
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
  const pendingBids = computed(() => 
    bids.value.filter(bid => bid.status === 'pending')
  )
  
  const acceptedBids = computed(() => 
    bids.value.filter(bid => bid.status === 'accepted')
  )
  
  const rejectedBids = computed(() => 
    bids.value.filter(bid => bid.status === 'rejected')
  )

  // Actions
  async function fetchBidsByRequest(requestId: string) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      bids.value = await service.getBidsByRequest(requestId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch bids'
      console.error('Error fetching bids:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchBidsByPartner(partnerId: string) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      bids.value = await service.getBidsByPartner(partnerId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch partner bids'
      console.error('Error fetching partner bids:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchBid(bidId: string) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      currentBid.value = await service.getBid(bidId)
      if (!currentBid.value) {
        error.value = 'Bid not found'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch bid'
      console.error('Error fetching bid:', err)
    } finally {
      loading.value = false
    }
  }

  async function createBid(bidData: Omit<Bid, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      const bidId = await service.createBid(bidData)
      
      // Refresh the bids list
      if (bidData.requestId) {
        await fetchBidsByRequest(bidData.requestId)
      }
      if (bidData.partnerId) {
        await fetchBidsByPartner(bidData.partnerId)
      }
      
      return bidId
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create bid'
      console.error('Error creating bid:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateBid(bidId: string, bidData: Partial<Bid>) {
    loading.value = true
    error.value = null
    try {
      const service = getFirestoreService()
      await service.updateBid(bidId, bidData)
      
      // Update local state
      const index = bids.value.findIndex(bid => bid.id === bidId)
      if (index !== -1) {
        bids.value[index] = { ...bids.value[index], ...bidData }
      }
      
      if (currentBid.value?.id === bidId) {
        currentBid.value = { ...currentBid.value, ...bidData }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update bid'
      console.error('Error updating bid:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function acceptBid(bidId: string) {
    await updateBid(bidId, { status: 'accepted' })
  }

  async function rejectBid(bidId: string) {
    await updateBid(bidId, { status: 'rejected' })
  }

  async function withdrawBid(bidId: string) {
    await updateBid(bidId, { status: 'withdrawn' })
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentBid() {
    currentBid.value = null
  }

  return {
    // State
    bids,
    currentBid,
    loading,
    error,
    
    // Computed
    pendingBids,
    acceptedBids,
    rejectedBids,
    
    // Actions
    fetchBidsByRequest,
    fetchBidsByPartner,
    fetchBid,
    createBid,
    updateBid,
    acceptBid,
    rejectBid,
    withdrawBid,
    clearError,
    clearCurrentBid,
  }
})

