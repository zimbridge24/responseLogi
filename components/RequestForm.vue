<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">견적 요청</h2>
    <BaseForm
      :loading="loading"
      submit-text="견적 요청"
      show-cancel
      @submit="handleSubmit"
      @cancel="$emit('cancel')"
    >
      <div class="space-y-6">
        <BaseInput
          name="title"
          v-model="title"
          label="제목"
          placeholder="견적 요청 제목을 입력하세요"
          :error="errors.title"
          required
        />

        <BaseTextarea
          name="description"
          v-model="description"
          label="상세 설명"
          placeholder="요구사항을 자세히 설명해주세요"
          :error="errors.description"
          required
          :rows="6"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseSelect
            name="category"
            v-model="category"
            :options="categoryOptions"
            label="카테고리"
            placeholder="카테고리를 선택하세요"
            :error="errors.category"
            required
          />

          <BaseInput
            name="budget"
            v-model="budget"
            type="number"
            label="예산 (원)"
            placeholder="예산을 입력하세요"
            :error="errors.budget"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput
            name="deadline"
            v-model="deadline"
            type="date"
            label="마감일"
            :error="errors.deadline"
          />

          <BaseInput
            name="location"
            v-model="location"
            label="위치"
            placeholder="서울, 부산 등"
            :error="errors.location"
          />
        </div>
      </div>
    </BaseForm>
  </div>
</template>

<script setup lang="ts">
import { useFormValidation } from '~/composables/useFormValidation'

interface RequestForm {
  title: string
  description: string
  category: string
  budget?: number
  deadline?: string
  location?: string
}

const emit = defineEmits<{
  submit: [data: RequestForm]
  cancel: []
}>()

const { handleSubmit: validateForm, errors, defineField, resetForm } = useFormValidation('request')

const [title] = defineField('title')
const [description] = defineField('description')
const [category] = defineField('category')
const [budget] = defineField('budget')
const [deadline] = defineField('deadline')
const [location] = defineField('location')

const loading = ref(false)

const categoryOptions = [
  { value: 'web-development', label: '웹 개발' },
  { value: 'mobile-development', label: '모바일 앱 개발' },
  { value: 'design', label: '디자인' },
  { value: 'marketing', label: '마케팅' },
  { value: 'consulting', label: '컨설팅' },
  { value: 'other', label: '기타' },
]

const handleSubmit = validateForm(async (values) => {
  loading.value = true
  try {
    const formData: RequestForm = {
      title: values.title,
      description: values.description,
      category: values.category,
      budget: values.budget ? Number(values.budget) : undefined,
      deadline: values.deadline || undefined,
      location: values.location || undefined,
    }
    emit('submit', formData)
  } finally {
    loading.value = false
  }
})
</script>