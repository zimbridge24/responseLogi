<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">요청 상세</h1>
    <div v-if="loading">로딩 중...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <div v-if="request" class="space-y-4">
      <div>
        <h2 class="text-lg font-semibold">제목: {{ request.title }}</h2>
        <p>설명: {{ request.description }}</p>
        <p>팔렛 수: {{ request.palletCount }}</p>
        <p>작성일: {{ request.createdAt?.toDate().toLocaleString() }}</p>
      </div>
      <div>
        <button @click="toggleView" class="btn-primary">
          {{ isCardView ? '표 보기' : '카드 보기' }}
        </button>
      </div>
      <div v-if="isCardView">
        <h3 class="text-lg font-bold mt-4">응찰 목록 (카드 뷰)</h3>
        <div v-for="bid in bids" :key="bid.id" class="card">
          <p>파트너 ID: {{ bid.partnerId }}</p>
          <p>응찰 금액: {{ bid.bidAmount }}</p>
          <nuxt-link 
            :to="`/chat/${requestId}_${user.currentUser.uid}_${bid.partnerId}`" 
            class="btn-primary"
          >
            채팅으로 이동
          </nuxt-link>
        </div>
      </div>
      <div v-else>
        <h3 class="text-lg font-bold mt-4">응찰 목록 (표 뷰)</h3>
        <table class="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th class="border border-gray-300 px-4 py-2">파트너 ID</th>
              <th class="border border-gray-300 px-4 py-2">응찰 금액</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bid in bids" :key="bid.id">
              <td class="border border-gray-300 px-4 py-2">{{ bid.partnerId }}</td>
              <td class="border border-gray-300 px-4 py-2">{{ bid.bidAmount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useRoute } from 'vue-router'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'

const { db } = useNuxtApp()
const user = useUserStore()
const route = useRoute()
const requestId = route.params.id

const request = ref(null)
const bids = ref([])
const loading = ref(true)
const error = ref('')
const isCardView = ref(true)

async function fetchRequest() {
  loading.value = true
  try {
    const docSnap = await getDoc(doc(db, 'requests', requestId))
    if (docSnap.exists()) {
      request.value = docSnap.data()
      const bidsSnap = await getDocs(collection(db, `requests/${requestId}/bids`))
      bids.value = bidsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } else {
      error.value = '요청을 찾을 수 없습니다.'
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function toggleView() {
  isCardView.value = !isCardView.value
}

onMounted(fetchRequest)
</script>