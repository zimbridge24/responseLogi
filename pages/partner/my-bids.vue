<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">내가 작성한 견적</h1>
    <div v-if="loading">로딩 중...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <div v-for="bid in bids" :key="bid.id" class="card">
      <h2 class="text-lg font-semibold">요청 ID: {{ bid.requestId }}</h2>
      <p>응찰 금액: {{ bid.bidAmount }}</p>
      <p>작성일: {{ bid.createdAt?.toDate().toLocaleString() }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useUserStore } from '~/stores/user'

const { db } = useNuxtApp()
const userStore = useUserStore()
const bids = ref([])
const loading = ref(true)
const error = ref('')

async function fetchMyBids() {
  loading.value = true
  try {
    const q = query(
      collection(db, 'requests'),
      where('partnerId', '==', userStore.currentUser?.uid)
    )
    const snap = await getDocs(q)
    bids.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchMyBids)
</script>