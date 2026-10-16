<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ value: { type: Number, default: 0 } })
const shown = ref(0)

watch(
  () => props.value,
  (to) => {
    const from = shown.value
    const start = performance.now()
    const dur = 700
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1)
      shown.value = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  },
  { immediate: true }
)
</script>

<template>{{ shown }}</template>
