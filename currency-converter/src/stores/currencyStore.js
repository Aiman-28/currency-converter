import { defineStore } from 'pinia'
import { SAMPLE_RATES, CURRENCIES, API_URL } from '../utils/currencies'
import { buildSamples } from '../utils/sampleData'

// History is stored per logged-in user so accounts never see each other's data
function historyKey() {
  try {
    const u = JSON.parse(localStorage.getItem('currentUser'))
    return u ? `conversionHistory_${u.email}` : 'conversionHistory_guest'
  } catch {
    return 'conversionHistory_guest'
  }
}

function currentEmail() {
  try {
    return JSON.parse(localStorage.getItem('currentUser'))?.email || null
  } catch {
    return null
  }
}

// Loads the user's history. The first time a user is seen, 20 sample conversions are added once.
function loadHistory() {
  let list = []
  try {
    const data = JSON.parse(localStorage.getItem(historyKey()))
    list = Array.isArray(data) ? data : []
  } catch {
    list = []
  }
  const email = currentEmail()
  const flag = 'sampleSeeded_' + email
  if (email && !localStorage.getItem(flag)) {
    list = [...list, ...buildSamples()]
    localStorage.setItem(historyKey(), JSON.stringify(list))
    localStorage.setItem(flag, '1')
  }
  return list
}

function mostFrequent(list) {
  if (!list.length) return null
  const counts = {}
  list.forEach((x) => (counts[x] = (counts[x] || 0) + 1))
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

export const useCurrencyStore = defineStore('currency', {
  state: () => ({
    rates: { ...SAMPLE_RATES },
    rateSource: 'sample', // 'live' | 'sample'
    updatedAt: null, // when the provider last updated its rates (ms)
    fetchedAt: null, // when we last checked (ms)
    loading: false,
    error: '',
    history: loadHistory()
  }),
  getters: {
    total: (s) => s.history.length,
    recent: (s) => [...s.history].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5),
    lastPair() {
      const last = this.recent[0]
      return last ? `${last.from} → ${last.to}` : null
    },
    mostUsedSource: (s) => mostFrequent(s.history.map((h) => h.from)),
    mostUsedTarget: (s) => mostFrequent(s.history.map((h) => h.to)),
    pairs: (s) => [...new Set(s.history.map((h) => `${h.from}-${h.to}`))].sort()
  },
  actions: {
    loadHistory() {
      this.history = loadHistory()
    },
    persist() {
      localStorage.setItem(historyKey(), JSON.stringify(this.history))
    },

    // Returns { ok, changed } so the UI can tell the user what happened
    async fetchRates() {
      this.loading = true
      this.error = ''
      const t0 = Date.now()
      let status = { ok: false, changed: false }
      try {
        const res = await fetch(API_URL)
        if (!res.ok) throw new Error('HTTP ' + res.status)
        const data = await res.json()
        if (data.result !== 'success' || !data.rates) throw new Error('Bad response')
        const next = {}
        CURRENCIES.forEach(({ code }) => {
          next[code] = data.rates[code] ?? SAMPLE_RATES[code]
        })
        const apiTime = data.time_last_update_unix ? data.time_last_update_unix * 1000 : Date.now()
        status = { ok: true, changed: apiTime !== this.updatedAt }
        this.rates = next
        this.rateSource = 'live'
        this.updatedAt = apiTime
        this.fetchedAt = Date.now()
      } catch {
        if (this.rateSource !== 'live') {
          this.rates = { ...SAMPLE_RATES }
          this.updatedAt = null
        }
        this.error =
          this.rateSource === 'live'
            ? 'Could not refresh rates. Showing the last loaded live rates.'
            : 'Live rates could not be loaded. Showing sample demonstration rates instead.'
      } finally {
        // keep the spinner visible long enough for the user to notice the refresh
        const wait = Math.max(0, 600 - (Date.now() - t0))
        if (wait) await new Promise((r) => setTimeout(r, wait))
        this.loading = false
      }
      return status
    },

    convert(amount, from, to) {
      const a = this.rates[from]
      const b = this.rates[to]
      if (!a || !b) return null
      const rate = b / a
      return { rate, result: amount * rate }
    },

    // Used by the Edit dialog: same pair keeps the saved rate, a new pair uses the current rate
    recalc(record, amount, from, to) {
      if (record && record.from === from && record.to === to) {
        return { rate: record.rate, result: amount * record.rate, rateSource: record.rateSource }
      }
      const c = this.convert(amount, from, to)
      return c ? { ...c, rateSource: this.rateSource } : null
    },

    addConversion({ amount, from, to, rate, result }) {
      this.history.unshift({
        id: Date.now() + Math.random(),
        amount, from, to, rate, result,
        rateSource: this.rateSource,
        timestamp: Date.now()
      })
      this.persist()
    },

    updateConversion(id, { amount, from, to }) {
      const item = this.history.find((h) => h.id === id)
      if (!item) return false
      const c = this.recalc(item, amount, from, to)
      if (!c) return false
      Object.assign(item, { amount, from, to, rate: c.rate, result: c.result, rateSource: c.rateSource, updatedAt: Date.now() })
      this.persist()
      return true
    },

    deleteConversion(id) {
      this.history = this.history.filter((h) => h.id !== id)
      this.persist()
    },

    clearHistory() {
      this.history = []
      this.persist()
    },

    addSamples() {
      this.history.push(...buildSamples())
      this.persist()
    }
  }
})
