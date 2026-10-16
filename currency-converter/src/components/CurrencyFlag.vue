<script setup>
import { flagUrl } from '../utils/currencies'

defineProps({ code: String, size: { type: Number, default: 20 } })
</script>

<template>
  <img
    v-if="code"
    :src="flagUrl(code)"
    :alt="code"
    class="flag"
    :style="{ width: size + 'px', height: size + 'px' }"
    loading="lazy"
    @error="$event.target.style.visibility = 'hidden'"
  />
</template>
