<script setup>
import { computed } from 'vue'
import { currencyName, formatMoney } from '../utils/currencies'
import CurrencyFlag from './CurrencyFlag.vue'

const props = defineProps({
  label: String,
  code: { type: String, required: true },
  amount: { type: Number, default: null },
  highlight: Boolean
})

const display = computed(() => (props.amount === null ? '—' : formatMoney(props.amount, props.code)))
</script>

<template>
  <div :class="['currency-card', { highlight }]">
    <span class="muted small">{{ label }}</span>
    <strong :key="display" class="big pop">{{ display }}</strong>
    <span class="muted small pair-cell"><CurrencyFlag :code="code" :size="18" /> {{ code }} · {{ currencyName(code) }}</span>
  </div>
</template>
