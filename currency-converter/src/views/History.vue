<script setup>
import { ref, computed } from 'vue'
import { useCurrencyStore } from '../stores/currencyStore'
import DeleteModal from '../components/DeleteModal.vue'
import ViewConversionModal from '../components/ViewConversionModal.vue'
import EditConversionModal from '../components/EditConversionModal.vue'
import CurrencyFlag from '../components/CurrencyFlag.vue'
import { currencyName, formatMoney, formatRate, formatDate } from '../utils/currencies'

const store = useCurrencyStore()
const search = ref('')
const pair = ref('')
const date = ref('')
const sort = ref('newest')
const deleteId = ref(null)
const showClear = ref(false)
const viewItem = ref(null)
const editItem = ref(null)
const notice = ref('')

function flash(msg) {
  notice.value = msg
  setTimeout(() => (notice.value = ''), 3500)
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = store.history.filter((h) => {
    const matchSearch =
      !q || [h.from, h.to, currencyName(h.from), currencyName(h.to)].some((t) => t.toLowerCase().includes(q))
    const matchPair = !pair.value || `${h.from}-${h.to}` === pair.value
    const matchDate = !date.value || new Date(h.timestamp).toLocaleDateString('en-CA') === date.value
    return matchSearch && matchPair && matchDate
  })
  const sorters = {
    newest: (a, b) => b.timestamp - a.timestamp,
    oldest: (a, b) => a.timestamp - b.timestamp,
    high: (a, b) => b.amount - a.amount,
    low: (a, b) => a.amount - b.amount
  }
  return [...list].sort(sorters[sort.value])
})

function resetFilters() {
  search.value = ''
  pair.value = ''
  date.value = ''
  sort.value = 'newest'
}

function addSamples() {
  store.addSamples()
  flash('20 sample conversions added.')
}

function askDelete(item) {
  viewItem.value = null
  deleteId.value = item.id
}

function openEdit(item) {
  viewItem.value = null
  editItem.value = item
}

function saveEdit(payload) {
  if (store.updateConversion(payload.id, payload)) flash('Conversion updated.')
  editItem.value = null
}

function confirmDelete() {
  store.deleteConversion(deleteId.value)
  deleteId.value = null
  flash('Conversion deleted.')
}

function confirmClear() {
  store.clearHistory()
  showClear.value = false
  flash('History cleared.')
}
</script>

<template>
<div class="page">
  <div class="row between">
    <h1>Conversion History</h1>
    <div class="head-actions">
      <button class="btn btn-outline" @click="addSamples">+ 20 sample conversions</button>
      <button class="btn btn-danger" :disabled="!store.total" @click="showClear = true">Clear history</button>
    </div>
  </div>

  <div v-if="notice" class="alert alert-success">{{ notice }}</div>

  <section class="card">
    <div class="filters">
      <input v-model="search" type="search" placeholder="Search by currency code or name…" />
      <select v-model="pair">
        <option value="">All pairs</option>
        <option v-for="p in store.pairs" :key="p" :value="p">{{ p.replace('-', ' → ') }}</option>
      </select>
      <input v-model="date" type="date" />
      <select v-model="sort">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="high">Highest amount</option>
        <option value="low">Lowest amount</option>
      </select>
      <button class="btn btn-outline" @click="resetFilters">Reset</button>
    </div>
  </section>

  <section class="card">
    <div v-if="!store.total" class="empty">
      No history yet. <router-link to="/converter">Convert something</router-link> and save it,
      or <button class="link-btn" @click="addSamples">add 20 sample conversions</button>.
    </div>
    <div v-else-if="!filtered.length" class="empty">No conversions match your search or filters.</div>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Amount</th><th>Pair</th><th>Rate</th><th>Converted</th><th>Date &amp; time</th><th>Actions</th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" name="row">
          <tr v-for="h in filtered" :key="h.id">
            <td>{{ formatMoney(h.amount, h.from) }}</td>
            <td><span class="pair-cell"><CurrencyFlag :code="h.from" /> {{ h.from }} → <CurrencyFlag :code="h.to" /> {{ h.to }}</span></td>
            <td>{{ formatRate(h.rate) }}</td>
            <td><strong>{{ formatMoney(h.result, h.to) }}</strong></td>
            <td>{{ formatDate(h.timestamp) }}<span v-if="h.updatedAt" class="badge edited">edited</span></td>
            <td>
              <div class="actions">
                <button class="btn btn-outline btn-sm" @click="viewItem = h">View</button>
                <button class="btn btn-sm" @click="openEdit(h)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="deleteId = h.id">Delete</button>
              </div>
            </td>
          </tr>
        </TransitionGroup>
      </table>
    </div>
    <p class="muted small">Showing {{ filtered.length }} of {{ store.total }} records.</p>
  </section>

  <ViewConversionModal :record="viewItem" @close="viewItem = null" @edit="openEdit" @delete="askDelete" />
  <EditConversionModal :record="editItem" @close="editItem = null" @save="saveEdit" />
  <DeleteModal
    :show="deleteId !== null"
    title="Delete this conversion?"
    message="This record will be permanently removed."
    @confirm="confirmDelete"
    @cancel="deleteId = null"
  />
  <DeleteModal
    :show="showClear"
    title="Clear all history?"
    message="All saved conversions will be permanently deleted."
    confirm-text="Clear all"
    @confirm="confirmClear"
    @cancel="showClear = false"
  />
</div>
</template>
