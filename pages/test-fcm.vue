<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">FCM 테스트 페이지</h1>
      
      <div class="space-y-4">
        <!-- 알림 권한 상태 -->
        <div class="p-4 bg-blue-50 rounded-lg">
          <h2 class="text-lg font-semibold text-blue-900 mb-2">알림 권한 상태</h2>
          <p class="text-blue-700">
            {{ notificationPermission }}
          </p>
        </div>

        <!-- FCM 토큰 -->
        <div class="p-4 bg-green-50 rounded-lg">
          <h2 class="text-lg font-semibold text-green-900 mb-2">FCM 토큰</h2>
          <p class="text-green-700 text-sm break-all">
            {{ fcmToken || '토큰이 없습니다' }}
          </p>
        </div>

        <!-- 테스트 버튼들 -->
        <div class="space-y-3">
          <button 
            @click="requestPermission"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            알림 권한 요청
          </button>

          <button 
            @click="getFCMToken"
            class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            FCM 토큰 발급
          </button>

          <button 
            @click="testNotification"
            class="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            테스트 알림 보내기
          </button>

          <button 
            @click="checkFirestoreToken"
            class="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Firestore 토큰 확인
          </button>
        </div>

        <!-- 로그 -->
        <div class="p-4 bg-gray-50 rounded-lg">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">로그</h2>
          <div class="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
            <div v-for="(log, index) in logs" :key="index" class="font-mono">
              {{ log }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const notificationPermission = ref('')
const fcmToken = ref('')
const logs = ref<string[]>([])

const addLog = (message: string) => {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${message}`)
}

const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    notificationPermission.value = permission
    addLog(`알림 권한: ${permission}`)
  } catch (error) {
    addLog(`알림 권한 요청 실패: ${error}`)
  }
}

const getFCMToken = async () => {
  try {
    const { $fcm } = useNuxtApp()
    if ($fcm?.getToken) {
      const token = await $fcm.getToken()
      fcmToken.value = token || '토큰 발급 실패'
      addLog(`FCM 토큰: ${token ? '발급 성공' : '발급 실패'}`)
    } else {
      addLog('FCM 플러그인을 찾을 수 없습니다')
    }
  } catch (error) {
    addLog(`FCM 토큰 발급 실패: ${error}`)
  }
}

const testNotification = () => {
  try {
    const { $fcm } = useNuxtApp()
    if ($fcm?.testNotification) {
      $fcm.testNotification()
      addLog('테스트 알림 전송됨')
    } else {
      addLog('테스트 알림 함수를 찾을 수 없습니다')
    }
  } catch (error) {
    addLog(`테스트 알림 실패: ${error}`)
  }
}

const checkFirestoreToken = async () => {
  try {
    const user = useUserStore()
    if (user.currentUser?.uid) {
      const { $db } = useNuxtApp()
      const { doc, getDoc } = await import('firebase/firestore')
      const userDoc = await getDoc(doc($db, 'users', user.currentUser.uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const storedToken = userData.fcmToken
        addLog(`Firestore 저장된 토큰: ${storedToken ? '있음' : '없음'}`)
        if (storedToken) {
          addLog(`토큰 일치: ${storedToken === fcmToken.value ? '예' : '아니오'}`)
        }
      } else {
        addLog('사용자 문서를 찾을 수 없습니다')
      }
    } else {
      addLog('로그인되지 않았습니다')
    }
  } catch (error) {
    addLog(`Firestore 확인 실패: ${error}`)
  }
}

onMounted(() => {
  // 초기 상태 확인
  notificationPermission.value = Notification.permission
  addLog(`페이지 로드됨 - 알림 권한: ${Notification.permission}`)
  
  // FCM 토큰 자동 발급 시도
  setTimeout(() => {
    getFCMToken()
  }, 2000)
})
</script>


