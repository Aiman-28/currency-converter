<script setup>
import { computed } from 'vue'
import { formatMoney, formatRate, formatDate, currencyName } from '../utils/currencies'
import CurrencyFlag from './CurrencyFlag.vue'

const props = defineProps({ record: { type: Object, default: null } })
defineEmits(['close', 'edit', 'delete'])

const rows = computed(() => {
  const r = props.record
  if (!r) return []
  return [
    ['Amount', `${formatMoney(r.amount, r.from)} (${currencyName(r.from)})`],
    ['Converted', `${formatMoney(r.result, r.to)} (${currencyName(r.to)})`],
    ['Exchange rate', `1 ${r.from} = ${formatRate(r.rate)} ${r.to}`],
    ['Inverse rate', `1 ${r.to} = ${formatRate(1 / r.rate)} ${r.from}`],
    ['Rate source', r.rateSource === 'live' ? 'Live market rates' : 'Sample demonstration rates'],
    ['Converted on', formatDate(r.timestamp)],
    ...(r.updatedAt ? [['Last edited', formatDate(r.updatedAt)]] : [])
  ]
})
</script>

<template>
  <Transition name="fade">
    <div v-if="record" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal card">
        <h3>Conversion details</h3>
        <p class="view-big pair-cell"><CurrencyFlag :code="record.from" :size="30" /> {{ record.from }} → <CurrencyFlag :code="record.to" :size="30" /> {{ record.to }}</p>
        <dl class="detail-list">
          <template v-for="[k, v] in rows" :key="k"><dt>{{ k }}</dt><dd>{{ v }}</dd></template>
        </dl>
        <div class="row end">
          <button class="btn btn-danger-outline" style="margin-right: auto" @click="$emit('delete', record)">🗑 Delete</button>
          <button class="btn btn-outline" @click="$emit('close')">Close</button>
          <button class="btn" @click="$emit('edit', record)">Edit</button>
        </div>
      </div>
    </div>
  </Transition>
</template>
