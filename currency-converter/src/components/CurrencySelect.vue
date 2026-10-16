<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { CURRENCIES } from '../utils/currencies'
import CurrencyFlag from './CurrencyFlag.vue'

const props = defineProps({ modelValue: String, id: String, label: String })
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const query = ref('')
const root = ref(null)
const searchEl = ref(null)

const current = computed(() => CURRENCIES.find((c) => c.code === props.modelValue))
const list = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? CURRENCIES.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)) : CURRENCIES
})

function toggle() {
  open.value = !open.value
  if (open.value) {
    query.value = ''
    nextTick(() => searchEl.value?.focus())
  }
}
function pick(c) {
  emit('update:modelValue', c.code)
  open.value = false
}
const onDoc = (e) => {
  if (root.value && !root.value.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('mousedown', onDoc))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDoc))
</script>

<template>
  <div ref="root" :class="['cselect', { open }]">
    <label :for="id">{{ label }}</label>
    <button :id="id" type="button" class="cs-btn" aria-haspopup="listbox" :aria-expanded="open" @click="toggle">
      <CurrencyFlag v-if="current" :code="current.code" :size="22" />
      <b>{{ current?.code || 'Select' }}</b>
      <span class="muted cs-name">{{ current?.name }}</span>
      <svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6" /></svg>
    </button>
    <Transition name="drop">
      <div v-if="open" class="cs-panel">
        <input ref="searchEl" v-model="query" type="search" placeholder="Search currency…" @keydown.esc="open = false" @keydown.enter.prevent="list[0] && pick(list[0])" />
        <ul role="listbox">
          <li v-for="c in list" :key="c.code" role="option" :class="{ active: c.code === modelValue }" @click="pick(c)">
            <CurrencyFlag :code="c.code" :size="22" />
            <b>{{ c.code }}</b><span class="muted">{{ c.name }}</span>
          </li>
          <li v-if="!list.length" class="none">No currency found</li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
