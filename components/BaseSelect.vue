<template>
  <div class="space-y-1">
    <label v-if="label" :for="name" class="form-label">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <select
      :id="name"
      :name="name"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      @blur="$emit('blur')"
      class="form-input"
      :class="{ 'border-red-500': error }"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    
    <p v-if="error" class="form-error">{{ error }}</p>
    <p v-if="help" class="text-sm text-gray-500">{{ help }}</p>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: string | number
  label: string
}

interface Props {
  name: string
  modelValue: string | number
  options: Option[]
  label?: string
  placeholder?: string
  error?: string
  help?: string
  required?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
})

defineEmits<{
  'update:modelValue': [value: string | number]
  blur: []
}>()
</script>
