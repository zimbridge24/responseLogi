<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <h1 class="text-xl font-bold text-gray-900">견적 플랫폼</h1>
            <div class="flex space-x-4">
              <NuxtLink to="/partner/requests" class="text-gray-700 hover:text-gray-900">요청 목록</NuxtLink>
              <NuxtLink to="/partner/bids" class="text-blue-600 font-medium">내 견적</NuxtLink>
              <NuxtLink to="/partner/chat" class="text-gray-700 hover:text-gray-900">채팅</NuxtLink>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-700">{{ userProfile?.name || '파트너' }}</span>
            <button @click="logout" class="text-gray-700 hover:text-gray-900">로그아웃</button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">내 견적 목록</h2>
        <div class="flex space-x-2">
          <select v-model="selectedStatus" class="form-input">
            <option value="">모든 상태</option>
            <option value="pending">대기중</option>
            <option value="accepted">수락됨</option>
            <option value="rejected">거절됨</option>
            <option value="withdrawn">철회됨</option>
          </select>
        </div>
      </div>

      <!-- Bids Table -->
      <div class="card">
        <BidsTable
          :bids="filteredBids"
          :loading="loading"
          :can-withdraw="true"
          @withdraw="withdrawBid"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'role-partner'
})

const { userProfile, logout } = useUserStore()
const { bids, loading, fetchBidsByPartner, withdrawBid: withdrawBidAction } = useBidsStore()

const selectedStatus = ref('')

const filteredBids = computed(() => {
  if (!selectedStatus.value) return bids
  return bids.filter(bid => bid.status === selectedStatus.value)
})

onMounted(async () => {
  if (userProfile?.id) {
    await fetchBidsByPartner(userProfile.id)
  }
})

const withdrawBid = async (bid: any) => {
  if (confirm('정말로 이 견적을 철회하시겠습니까?')) {
    try {
      await withdrawBidAction(bid.id)
    } catch (error) {
      console.error('Error withdrawing bid:', error)
    }
  }
}
</script>