<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useCurrencyStore } from '../stores/currencyStore'
import DashboardStats from '../components/DashboardStats.vue'
import RateTicker from '../components/RateTicker.vue'
import UserAvatar from '../components/UserAvatar.vue'
import CurrencyFlag from '../components/CurrencyFlag.vue'
import ViewConversionModal from '../components/ViewConversionModal.vue'
import EditConversionModal from '../components/EditConversionModal.vue'
import DeleteModal from '../components/DeleteModal.vue'
import { formatMoney, formatDate, formatRate } from '../utils/currencies'

const auth = useAuthStore()
const store = useCurrencyStore()
const viewItem = ref(null)
const editItem = ref(null)
const deleteId = ref(null)

const stats = computed(() => [
  { icon: '🔁', label: 'Total Conversions', value: store.total },
  { icon: '📤', label: 'Most Used Source', value: store.mostUsedSource || '—' },
  { icon: '📥', label: 'Most Used Target', value: store.mostUsedTarget || '—' },
  { icon: '🕘', label: 'Last Used Pair', value: store.lastPair || '—' }
])

function askDelete(item) {
  viewItem.value = null
  deleteId.value = item.id
}
function confirmDelete() {
  store.deleteConversion(deleteId.value)
  deleteId.value = null
}

function openEdit(item) {
  viewItem.value = null
  editItem.value = item
}
function saveEdit(payload) {
  store.updateConversion(payload.id, payload)
  editItem.value = null
}
</script>

<template>
  <div class="page">
    <section class="hero card rise">
      <div class="hero-main">
        <UserAvatar :user="auth.currentUser" :size="64" class="hero-avatar" />
        <div>
          <p class="eyebrow">Dashboard</p>
          <h1>Hello, <span class="grad">{{ auth.currentUser?.name }}</span> 👋</h1>
          <p class="muted">Here is a summary of your conversion activity.</p>
          <div class="row">
            <router-link to="/converter" class="btn btn-dark">Start converting</router-link>
            <router-link to="/history" class="btn btn-outline">View history</router-link>
          </div>
        </div>
      </div>
      <div class="orbs">
        <router-link class="orb o1" :to="{ name: 'converter', query: { from: 'USD', to: 'PKR' } }" title="Convert USD">$</router-link>
        <router-link class="orb o2" :to="{ name: 'converter', query: { from: 'EUR', to: 'PKR' } }" title="Convert EUR">€</router-link>
        <router-link class="orb o3" :to="{ name: 'converter', query: { from: 'GBP', to: 'PKR' } }" title="Convert GBP">£</router-link>
        <router-link class="orb o4" :to="{ name: 'converter', query: { from: 'PKR', to: 'USD' } }" title="Convert PKR">₨</router-link>
      </div>
    </section>

    <RateTicker />
    <DashboardStats :stats="stats" />

    <section class="card rise" style="animation-delay: 350ms">
      <div class="row between">
        <h3>Recent conversions <span class="muted small">· click one to see details</span></h3>
        <router-link to="/converter" class="btn btn-sm">New conversion</router-link>
      </div>

      <div v-if="!store.recent.length" class="empty">
        No conversions yet. <router-link to="/converter">Make your first one</router-link>.
      </div>
      <TransitionGroup v-else tag="ul" name="row" class="list">
        <li
          v-for="h in store.recent" :key="h.id" class="clickable" role="button" tabindex="0" title="Click to view details"
          @click="viewItem = h" @keydown.enter="viewItem = h"
        >
          <div class="li-main">
            <span class="flags"><CurrencyFlag :code="h.from" :size="26" /><CurrencyFlag :code="h.to" :size="26" /></span>
            <div>
              <strong>{{ formatMoney(h.amount, h.from) }} → {{ formatMoney(h.result, h.to) }}</strong>
              <div class="muted small">{{ h.from }} to {{ h.to }} · rate {{ formatRate(h.rate) }}</div>
            </div>
          </div>
          <span class="muted small li-date">
            {{ formatDate(h.timestamp) }}
            <button type="button" class="row-del" title="Delete this conversion" aria-label="Delete this conversion" @click.stop="deleteId = h.id" @keydown.enter.stop>🗑</button>
            <b class="go">›</b>
          </span>
        </li>
      </TransitionGroup>
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
  </div>
</template>
