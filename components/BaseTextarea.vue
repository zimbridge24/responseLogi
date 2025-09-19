<template>
  <div class="space-y-1">
    <label v-if="label" :for="name" class="form-label">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <textarea
      :id="name"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @blur="$emit('blur')"
      class="form-input resize-none"
      :class="{ 'border-red-500': error }"
    />
    
    <p v-if="error" class="form-error">{{ error }}</p>
    <p v-if="help" class="text-sm text-gray-500">{{ help }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  modelValue: string
  label?: string
  placeholder?: string
  error?: string
  help?: string
  required?: boolean
  disabled?: boolean
  rows?: number
}

withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  rows: 4,
})

defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()
</script>
