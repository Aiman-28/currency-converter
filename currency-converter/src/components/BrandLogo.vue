<script setup>
defineProps({ name: { type: String, default: 'CURRENCYX' } })
</script>

<template>
  <span class="brand-logo">
    <svg width="32" height="32" viewBox="0 0 40 40" aria-hidden="true">
      <path d="M12 10l-3-7 8 4M28 10l3-7-8 4" fill="#8ec5ff" />
      <rect x="5" y="8" width="30" height="28" rx="14" fill="#2f80ed" />
      <circle cx="15" cy="21" r="5" fill="#fff" /><circle cx="25" cy="21" r="5" fill="#fff" />
      <circle cx="16" cy="22" r="2.4" fill="#14213d" /><circle cx="26" cy="22" r="2.4" fill="#14213d" />
      <path d="M15 29q5 4 10 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" />
    </svg>
    {{ name }}
  </span>
</template>
