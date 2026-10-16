<script setup>
import { ref, computed, watch } from 'vue'
import { useCurrencyStore } from '../stores/currencyStore'
import CurrencySelect from './CurrencySelect.vue'
import { formatMoney, formatRate } from '../utils/currencies'

const props = defineProps({ record: { type: Object, default: null } })
const emit = defineEmits(['close', 'save'])
const store = useCurrencyStore()

const amount = ref('')
const from = ref('USD')
const to = ref('PKR')

// refill the form every time a different record is opened
watch(
  () => props.record,
  (r) => {
    if (r) {
      amount.value = String(r.amount)
      from.value = r.from
      to.value = r.to
    }
  },
  { immediate: true }
)

const error = computed(() => {
  const v = amount.value.toString().trim()
  if (v === '') return 'Amount is required.'
  if (isNaN(Number(v))) return 'Amount must be a valid number.'
  if (Number(v) < 0) return 'Amount cannot be negative.'
  if (from.value === to.value) return 'Choose two different currencies.'
  return ''
})
const preview = computed(() => (error.value ? null : store.recalc(props.record, Number(amount.value), from.value, to.value)))

function save() {
  if (error.value || !preview.value) return
  emit('save', { id: props.record.id, amount: Number(amount.value), from: from.value, to: to.value })
}
</script>

<template>
  <Transition name="fade">
    <div v-if="record" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal card">
        <h3>Edit conversion</h3>
        <label for="edit-amount">Amount</label>
        <input id="edit-amount" v-model="amount" type="text" inputmode="decimal" placeholder="Enter amount" />
        <div class="edit-grid">
          <CurrencySelect id="edit-from" v-model="from" label="From" />
          <CurrencySelect id="edit-to" v-model="to" label="To" />
        </div>
        <small v-if="error" class="error">{{ error }}</small>
        <div v-else-if="preview" class="alert alert-info edit-preview">
          {{ formatMoney(Number(amount), from) }} → <strong>{{ formatMoney(preview.result, to) }}</strong>
          <span class="muted small"> · rate {{ formatRate(preview.rate) }}</span>
        </div>
        <p class="muted small">Same pair keeps the saved rate; a new pair uses the current rate.</p>
        <div class="row end">
          <button class="btn btn-outline" @click="$emit('close')">Cancel</button>
          <button class="btn" :disabled="!!error" @click="save">Save changes</button>
        </div>
      </div>
    </div>
  </Transition>
</template>
