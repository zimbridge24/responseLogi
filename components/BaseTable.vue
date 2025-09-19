<template>
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="column.class"
          >
            {{ column.label }}
          </th>
          <th v-if="showActions" class="w-32">작업</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading" class="text-center">
          <td :colspan="columns.length + (showActions ? 1 : 0)" class="py-8">
            <div class="animate-spin mx-auto w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </td>
        </tr>
        <tr v-else-if="data.length === 0" class="text-center">
          <td :colspan="columns.length + (showActions ? 1 : 0)" class="py-8 text-gray-500">
            데이터가 없습니다
          </td>
        </tr>
        <tr v-else v-for="(row, index) in data" :key="getRowKey(row, index)">
          <td
            v-for="column in columns"
            :key="column.key"
            :class="column.class"
          >
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :value="getNestedValue(row, column.key)"
              :index="index"
            >
              {{ formatValue(getNestedValue(row, column.key), column.format) }}
            </slot>
          </td>
          <td v-if="showActions" class="text-center">
            <slot name="actions" :row="row" :index="index">
              <button
                v-if="onEdit"
                @click="onEdit(row)"
                class="text-blue-600 hover:text-blue-800 mr-2"
              >
                수정
              </button>
              <button
                v-if="onDelete"
                @click="onDelete(row)"
                class="text-red-600 hover:text-red-800"
              >
                삭제
              </button>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
  class?: string
  format?: 'text' | 'date' | 'currency' | 'number'
}

interface Props {
  data: any[]
  columns: Column[]
  loading?: boolean
  showActions?: boolean
  rowKey?: string
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showActions: false,
  rowKey: 'id',
})

const getRowKey = (row: any, index: number) => {
  return props.rowKey ? row[props.rowKey] : index
}

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const formatValue = (value: any, format?: string) => {
  if (value === null || value === undefined) return '-'
  
  switch (format) {
    case 'date':
      return new Date(value).toLocaleDateString('ko-KR')
    case 'currency':
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
      }).format(value)
    case 'number':
      return new Intl.NumberFormat('ko-KR').format(value)
    default:
      return value
  }
}
</script>
