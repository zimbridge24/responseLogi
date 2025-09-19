<template>
  <form @submit="onSubmit" class="space-y-6">
    <slot />
    
    <div class="flex justify-end space-x-4">
      <button
        v-if="showCancel"
        type="button"
        @click="$emit('cancel')"
        class="btn-secondary"
      >
        취소
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading" class="animate-spin mr-2">⟳</span>
        {{ submitText }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
interface Props {
  loading?: boolean
  submitText?: string
  showCancel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  submitText: '제출',
  showCancel: false,
})

const emit = defineEmits<{
  submit: []
  cancel: []
}>()

const onSubmit = () => {
  emit('submit')
}
</script>
