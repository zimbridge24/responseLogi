<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">파트너 허브</h1>
    <ul class="space-y-4">
      <li>
        <nuxt-link to="/partner/bids" class="btn-primary">응찰 가능한 요청 보기</nuxt-link>
      </li>
      <li>
        <nuxt-link to="/partner/my-bids" class="btn-primary">내가 작성한 견적 보기</nuxt-link>
      </li>
      <li>
        <nuxt-link to="/partner/chat" class="btn-primary">채팅</nuxt-link>
      </li>
    </ul>
  </div>
</template>