<script setup>
import { computed } from 'vue'

const props = defineProps({ user: { type: Object, default: null }, size: { type: Number, default: 34 } })

const initials = computed(() => {
  const n = (props.user?.name || '?').trim().split(/\s+/)
  return ((n[0]?.[0] || '?') + (n[1]?.[0] || '')).toUpperCase()
})
const hue = computed(() => {
  let h = 0
  for (const c of props.user?.name || '') h = (h * 31 + c.charCodeAt(0)) % 360
  return h
})
const bg = computed(() =>
  props.user?.avatar ? 'none' : `linear-gradient(135deg, hsl(${hue.value}, 70%, 55%), hsl(${(hue.value + 40) % 360}, 70%, 42%))`
)
</script>

<template>
  <span class="avatar-img" :style="{ width: size + 'px', height: size + 'px', fontSize: size * 0.38 + 'px', background: bg }">
    <img v-if="user?.avatar" :src="user.avatar" alt="" />
    <template v-else>{{ initials }}</template>
  </span>
</template>
