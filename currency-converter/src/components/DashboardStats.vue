<script setup>
import CountUp from './CountUp.vue'

defineProps({
  stats: { type: Array, required: true } // [{ label, value, icon }]
})
</script>

<template>
  <div class="stats-grid">
    <div v-for="(s, i) in stats" :key="s.label" class="card stat rise" :style="{ animationDelay: i * 90 + 'ms' }">
      <div class="stat-icon">{{ s.icon }}</div>
      <div>
        <div class="stat-value"><CountUp v-if="typeof s.value === 'number'" :value="s.value" /><span v-else>{{ s.value }}</span></div>
        <div class="muted">{{ s.label }}</div>
      </div>
    </div>
  </div>
</template>
