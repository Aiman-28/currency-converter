<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: String,
  id: String,
  type: { type: String, default: 'text' },
  error: String,
  autocomplete: String
})
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'reveal'])

const show = ref(false)
const inputType = computed(() => (props.type === 'password' && show.value ? 'text' : props.type))

function toggle() {
  show.value = !show.value
  emit('reveal', show.value)
}
</script>

<template>
  <div :class="['field', { invalid: error }]">
    <input
      :id="id"
      :type="inputType"
      :value="modelValue"
      :autocomplete="autocomplete"
      placeholder=" "
      @input="emit('update:modelValue', $event.target.value)"
      @focus="emit('focus')"
      @blur="emit('blur')"
    />
    <label :for="id">{{ label }}</label>
    <button v-if="type === 'password'" type="button" class="eye-btn" :aria-label="show ? 'Hide password' : 'Show password'" @click="toggle">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" />
        <path v-if="show" d="M3 3l18 18" />
      </svg>
    </button>
    <Transition name="slide">
      <small v-if="error" class="error">{{ error }}</small>
    </Transition>
  </div>
</template>
