<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">견적 신청</h1>
    <form @submit.prevent="submitRequest" class="space-y-4">
      <div>
        <label class="block text-sm font-medium">제목</label>
        <input v-model="title" type="text" class="input" placeholder="제목을 입력하세요" required />
      </div>
      <div>
        <label class="block text-sm font-medium">설명</label>
        <textarea v-model="description" class="textarea" placeholder="설명을 입력하세요" required></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium">팔렛 수</label>
        <input v-model.number="palletCount" type="number" class="input" placeholder="팔렛 수를 입력하세요" required />
      </div>
      <button type="submit" class="btn-primary">신청하기</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useUserStore } from '~/stores/user'

const title = ref('')
const description = ref('')
const palletCount = ref(0)
const { db } = useNuxtApp()
const userStore = useUserStore()

async function submitRequest() {
  if (!userStore.currentUser) {
    alert('로그인이 필요합니다.')
    return
  }
  await addDoc(collection(db, 'requests'), {
    title: title.value,
    description: description.value,
    palletCount: palletCount.value,
    sellerId: userStore.currentUser.uid,
    createdAt: serverTimestamp(),
  })
  alert('견적 신청이 완료되었습니다.')
}
</script>