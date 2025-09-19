<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">견적 제출</h2>
    <BaseForm
      :loading="loading"
      submit-text="견적 제출"
      show-cancel
      @submit="handleSubmit"
      @cancel="$emit('cancel')"
    >
      <div class="space-y-6">
        <BaseInput
          name="amount"
          v-model="amount"
          type="number"
          label="견적 금액 (원)"
          placeholder="견적 금액을 입력하세요"
          :error="errors.amount"
          required
        />

        <BaseTextarea
          name="description"
          v-model="description"
          label="견적 상세 설명"
          placeholder="견적에 대한 상세한 설명을 작성해주세요"
          :error="errors.description"
          required
          :rows="6"
        />

        <BaseInput
          name="estimatedDuration"
          v-model="estimatedDuration"
          label="예상 작업 기간"
          placeholder="예: 2주, 1개월 등"
          :error="errors.estimatedDuration"
        />
      </div>
    </BaseForm>
  </div>
</template>

<script setup lang="ts">
import { useFormValidation } from '~/composables/useFormValidation'

interface BidForm {
  amount: number
  description: string
  estimatedDuration?: string
}

const emit = defineEmits<{
  submit: [data: BidForm]
  cancel: []
}>()

const { handleSubmit: validateForm, errors, defineField } = useFormValidation('bid')

const [amount] = defineField('amount')
const [description] = defineField('description')
const [estimatedDuration] = defineField('estimatedDuration')

const loading = ref(false)

const handleSubmit = validateForm(async (values) => {
  loading.value = true
  try {
    const formData: BidForm = {
      amount: Number(values.amount),
      description: values.description,
      estimatedDuration: values.estimatedDuration || undefined,
    }
    emit('submit', formData)
  } finally {
    loading.value = false
  }
})
</script>