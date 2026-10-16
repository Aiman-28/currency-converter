<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCurrencyStore } from '../stores/currencyStore'
import CurrencyCard from '../components/CurrencyCard.vue'
import CurrencySelect from '../components/CurrencySelect.vue'
import { CURRENCIES, formatRate, formatDate, formatTime } from '../utils/currencies'

const store = useCurrencyStore()
const route = useRoute()
const amount = ref('1')
const from = ref('USD')
const to = ref('PKR')
const success = ref('')
const refreshMsg = ref('')
const refreshType = ref('success')

const known = (c) => CURRENCIES.some((x) => x.code === c)

// opened from a dashboard coin / ticker chip: /converter?from=USD&to=PKR
function applyQuery() {
  const { from: f, to: t, amount: a } = route.query
  if (known(f)) from.value = f
  if (known(t)) to.value = t
  if (a && !isNaN(Number(a))) amount.value = String(a)
}

onMounted(() => {
  applyQuery()
  store.fetchRates()
})
watch(() => route.query, applyQuery)

const amountError = computed(() => {
  const v = amount.value.toString().trim()
  if (v === '') return 'Amount is required.'
  if (isNaN(Number(v))) return 'Amount must be a valid number.'
  if (Number(v) < 0) return 'Amount cannot be negative.'
  return ''
})
const selectionError = computed(() => (!from.value || !to.value ? 'Please select both currencies.' : ''))
const sameCurrency = computed(() => from.value && from.value === to.value)

const conversion = computed(() => {
  if (amountError.value || selectionError.value) return null
  return store.convert(Number(amount.value), from.value, to.value)
})

const canSave = computed(() => !!conversion.value && !sameCurrency.value && !store.loading)

watch([amount, from, to], () => (success.value = ''))

function swap() {
  ;[from.value, to.value] = [to.value, from.value]
}

function save() {
  if (!canSave.value) return
  store.addConversion({
    amount: Number(amount.value),
    from: from.value,
    to: to.value,
    rate: conversion.value.rate,
    result: conversion.value.result
  })
  success.value = 'Conversion saved to history.'
}

async function refresh() {
  refreshMsg.value = ''
  const r = await store.fetchRates()
  if (!r.ok) {
    refreshType.value = 'warn'
    refreshMsg.value = store.error
  } else {
    refreshType.value = 'success'
    refreshMsg.value = r.changed ? 'New exchange rates loaded.' : 'Rates are already up to date (the provider updates them once a day).'
  }
  setTimeout(() => (refreshMsg.value = ''), 5000)
}
</script>

<template>
<div class="page">
  <h1>Currency Converter</h1>

  <div v-if="store.loading" class="alert alert-info"><span class="spinner"></span> Loading exchange rates…</div>
  <div v-else-if="store.error" class="alert alert-warn">{{ store.error }}</div>

  <section class="card allow-overflow">
    <div class="converter-grid">
      <div>
        <label for="amount">Amount</label>
        <input id="amount" v-model="amount" type="text" inputmode="decimal" placeholder="Enter amount" />
      </div>
      <CurrencySelect id="from" v-model="from" label="From" />
      <button class="btn btn-outline swap" type="button" @click="swap" title="Swap currencies">⇄</button>
      <CurrencySelect id="to" v-model="to" label="To" />
    </div>

    <small v-if="amountError" class="error">{{ amountError }}</small>
    <small v-if="selectionError" class="error">{{ selectionError }}</small>
    <div v-if="sameCurrency && !amountError" class="alert alert-warn">
      Source and target currencies are the same. Choose different currencies to save a conversion.
    </div>

    <div v-if="conversion" class="result">
      <CurrencyCard label="You send" :code="from" :amount="Number(amount)" />
      <CurrencyCard label="They receive" :code="to" :amount="conversion.result" highlight />
    </div>
    <div v-else-if="!amountError && !selectionError && !store.loading" class="alert alert-error">
      Exchange-rate data is unavailable for this pair.
    </div>

    <div v-if="conversion" class="muted small rate-info">
      <div>1 {{ from }} = <strong>{{ formatRate(conversion.rate) }}</strong> {{ to }} &nbsp;·&nbsp; 1 {{ to }} = {{ formatRate(1 / conversion.rate) }} {{ from }}</div>
      <div v-if="store.rateSource === 'live'">
        Live rates · provider updated {{ formatDate(store.updatedAt) }} · last checked {{ formatTime(store.fetchedAt) }}
      </div>
      <div v-else>⚠ Sample demonstration rates — not current market rates.</div>
    </div>

    <div class="row">
      <button class="btn" type="button" :disabled="!canSave" @click="save">Save to history</button>
      <button class="btn btn-outline" type="button" :disabled="store.loading" @click="refresh">
        <span v-if="store.loading" class="spinner"></span>
        {{ store.loading ? 'Refreshing…' : '↻ Refresh rates' }}
      </button>
    </div>
    <div v-if="refreshMsg" :class="['alert', 'alert-' + refreshType]">{{ refreshMsg }}</div>
    <div v-if="success" class="alert alert-success">
      {{ success }} <router-link to="/history">View history</router-link>
    </div>
  </section>

  <section class="card" v-if="store.lastPair">
    <span class="muted">Most recently used pair:</span> <strong>{{ store.lastPair }}</strong>
  </section>
</div>
</template>
