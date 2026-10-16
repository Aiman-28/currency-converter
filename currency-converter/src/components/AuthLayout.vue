<script setup>
import CoinScene from './CoinScene.vue'
import BrandLogo from './BrandLogo.vue'

defineProps({
  title: String,
  subtitle: String,
  shy: Boolean
})
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <CoinScene :shy="shy" class="auth-banner">CONVERT.<br />TRACK.<br /><span class="acc">SAVE.</span></CoinScene>
      <section class="auth-panel">
        <div class="auth-head">
          <BrandLogo class="brand-row" />
          <h1>{{ title }}</h1>
          <p class="muted sub">{{ subtitle }}</p>
        </div>
        <slot />
      </section>
    </div>
  </div>
</template>
