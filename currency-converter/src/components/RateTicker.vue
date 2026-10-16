<script setup>
import { computed, onMounted } from 'vue'
import { useCurrencyStore } from '../stores/currencyStore'
import { CURRENCIES, formatRate, formatDate } from '../utils/currencies'
import CurrencyFlag from './CurrencyFlag.vue'

const store = useCurrencyStore()

onMounted(() => {
  if (!store.updatedAt && !store.loading) store.fetchRates()
})

const items = computed(() =>
  CURRENCIES.filter((c) => c.code !== 'USD').map((c) => ({ code: c.code, rate: store.rates[c.code] }))
)
</script>

<template>
  <section class="card rise" style="animation-delay: 120ms">
    <div class="row between">
      <h3>Exchange rates <span class="muted small">(1 USD = · click a currency to convert)</span></h3>
      <span v-if="store.loading" class="badge"><span class="spinner"></span> Loading…</span>
      <span v-else-if="store.rateSource === 'live'" class="badge live">● Live</span>
      <span v-else class="badge sample">Sample data</span>
    </div>
    <p v-if="store.error && !store.loading" class="muted small">{{ store.error }}</p>
    <p v-else-if="store.updatedAt" class="muted small">Provider updated {{ formatDate(store.updatedAt) }}</p>
    <div class="ticker">
      <div class="track">
        <router-link
          v-for="(it, i) in [...items, ...items]" :key="i" class="tick"
          :to="{ name: 'converter', query: { from: 'USD', to: it.code } }" :title="`Convert USD to ${it.code}`"
        >
          <CurrencyFlag :code="it.code" :size="18" /> <strong>{{ it.code }}</strong> {{ formatRate(it.rate) }}
        </router-link>
      </div>
    </div>
  </section>
</template>
