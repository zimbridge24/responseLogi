<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">견적 목록</h2>
    <BaseTable
      :data="bids"
      :columns="columns"
      :loading="loading"
      :show-actions="showActions"
      @edit="onEdit"
      @delete="onDelete"
    >
      <template #cell-status="{ value }">
        <span
          :class="{
            'text-yellow-600': value === 'pending',
            'text-green-600': value === 'accepted',
            'text-red-600': value === 'rejected',
            'text-gray-600': value === 'withdrawn'
          }"
          class="font-medium"
        >
          {{ getStatusText(value) }}
        </span>
      </template>

      <template #cell-amount="{ value }">
        {{ formatCurrency(value) }}
      </template>

      <template #cell-createdAt="{ value }">
        {{ formatDate(value) }}
      </template>

      <template #actions="{ row }">
        <button
          v-if="canAccept && row.status === 'pending'"
          @click="acceptBid(row)"
          class="text-green-600 hover:text-green-800 mr-2"
        >
          수락
        </button>
        <button
          v-if="canReject && row.status === 'pending'"
          @click="rejectBid(row)"
          class="text-red-600 hover:text-red-800 mr-2"
        >
          거절
        </button>
        <button
          v-if="canWithdraw && row.status === 'pending'"
          @click="withdrawBid(row)"
          class="text-gray-600 hover:text-gray-800 mr-2"
        >
          철회
        </button>
        <button
          v-if="onEdit"
          @click="onEdit(row)"
          class="text-blue-600 hover:text-blue-800"
        >
          수정
        </button>
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import type { Bid } from '~/lib/types'

interface Props {
  bids: Bid[]
  loading?: boolean
  showActions?: boolean
  canAccept?: boolean
  canReject?: boolean
  canWithdraw?: boolean
  onEdit?: (bid: Bid) => void
  onDelete?: (bid: Bid) => void
  onAccept?: (bid: Bid) => void
  onReject?: (bid: Bid) => void
  onWithdraw?: (bid: Bid) => void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showActions: true,
  canAccept: false,
  canReject: false,
  canWithdraw: false,
})

const columns = [
  { key: 'amount', label: '견적 금액', format: 'currency' },
  { key: 'description', label: '설명' },
  { key: 'estimatedDuration', label: '예상 기간' },
  { key: 'status', label: '상태' },
  { key: 'createdAt', label: '제출일', format: 'date' },
]

const getStatusText = (status: string) => {
  const statusMap = {
    pending: '대기중',
    accepted: '수락됨',
    rejected: '거절됨',
    withdrawn: '철회됨'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(value)
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ko-KR')
}

const acceptBid = (bid: Bid) => {
  props.onAccept?.(bid)
}

const rejectBid = (bid: Bid) => {
  props.onReject?.(bid)
}

const withdrawBid = (bid: Bid) => {
  props.onWithdraw?.(bid)
}
</script>